"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy, AlertCircle } from "lucide-react";
import Link from "next/link";

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface Quiz {
  _id: string;
  title: string;
  moduleId: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit: number;
}

interface Course {
  _id: string;
  title: string;
  quizzes: Quiz[];
  modules: Array<{
    _id: string;
    title: string;
  }>;
}

interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    points: number;
  }>;
}

export default function QuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId");
  const moduleId = searchParams.get("moduleId");

  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${params.slug}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setCourse(data.course);

      if (quizId && data.course.quizzes) {
        const foundQuiz = data.course.quizzes.find((q: Quiz) => q._id === quizId);
        setQuiz(foundQuiz || null);
        if (foundQuiz) {
          setTimeLeft(foundQuiz.timeLimit * 60);
        }
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  }, [params.slug, quizId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async () => {
    if (!quiz || !course || !startedAt || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formattedAnswers = quiz.questions.map((q) => ({
        questionId: q._id,
        selectedOption: answers[q._id] ?? -1,
      }));

      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course._id,
          quizId: quiz._id,
          moduleId,
          answers: formattedAnswers,
          startedAt: startedAt.toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setResult(data.result);
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, course, startedAt, answers, moduleId, isSubmitting]);

  // Timer effect
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, result, handleSubmit]);

  const startQuiz = () => {
    setQuizStarted(true);
    setStartedAt(new Date());
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getModuleTitle = (modId: string) => {
    return course?.modules.find((m) => m._id === modId)?.title || "Unknown Module";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-surface-400 mb-4" />
            <h2 className="text-xl font-semibold text-surface-900 mb-2">Quiz Not Found</h2>
            <p className="text-surface-600 mb-6">
              The quiz you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href={`/dashboard/courses/${params.slug}`}>
              <Button>Back to Course</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show result page
  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              result.passed ? "bg-accent-100" : "bg-red-100"
            }`}>
              {result.passed ? (
                <Trophy className="w-10 h-10 text-accent-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {result.passed ? "Congratulations!" : "Keep Practicing!"}
            </CardTitle>
            <CardDescription>
              {result.passed
                ? "You passed the quiz successfully!"
                : "You didn't reach the passing score. Try again!"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-50 rounded-xl text-center">
                <div className="text-3xl font-bold text-surface-900">
                  {result.score}/{result.maxScore}
                </div>
                <div className="text-sm text-surface-600">Points</div>
              </div>
              <div className="p-4 bg-surface-50 rounded-xl text-center">
                <div className={`text-3xl font-bold ${
                  result.passed ? "text-accent-600" : "text-red-600"
                }`}>
                  {result.percentage}%
                </div>
                <div className="text-sm text-surface-600">Score (Pass: {result.passingScore}%)</div>
              </div>
            </div>

            {/* Time Spent */}
            <div className="flex items-center justify-center gap-2 text-surface-600">
              <Clock className="w-4 h-4" />
              <span>Time spent: {formatTime(result.timeSpent)}</span>
            </div>

            {/* Answer Review */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-surface-900 mb-4">Answer Review</h3>
              <div className="space-y-4">
                {quiz.questions.map((question, index) => {
                  const answer = result.answers.find((a) => a.questionId === question._id);
                  const isCorrect = answer?.isCorrect || false;
                  
                  return (
                    <div
                      key={question._id}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect ? "border-accent-200 bg-accent-50" : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-accent-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-surface-900">
                            Q{index + 1}: {question.question}
                          </p>
                          <p className="text-sm text-surface-600 mt-1">
                            Your answer: {question.options[answer?.selectedOption ?? -1] || "Not answered"}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-accent-700 mt-1">
                              Correct answer: {question.options[question.correctAnswer]}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {answer?.points || 0}/{question.points} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <Link href={`/dashboard/courses/${params.slug}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Course
                </Button>
              </Link>
              {!result.passed && (
                <Button
                  className="flex-1"
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                    setCurrentQuestion(0);
                    setQuizStarted(false);
                    setTimeLeft(quiz.timeLimit * 60);
                  }}
                >
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show quiz start page
  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Link
          href={`/dashboard/courses/${params.slug}`}
          className="inline-flex items-center gap-2 text-surface-600 hover:text-surface-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            <CardDescription>
              Module: {getModuleTitle(quiz.moduleId || moduleId || "")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-surface-50 rounded-xl">
                <div className="text-2xl font-bold text-surface-900">
                  {quiz.questions.length}
                </div>
                <div className="text-sm text-surface-600">Questions</div>
              </div>
              <div className="p-4 bg-surface-50 rounded-xl">
                <div className="text-2xl font-bold text-surface-900">
                  {quiz.timeLimit} min
                </div>
                <div className="text-sm text-surface-600">Time Limit</div>
              </div>
              <div className="p-4 bg-surface-50 rounded-xl">
                <div className="text-2xl font-bold text-surface-900">
                  {quiz.passingScore}%
                </div>
                <div className="text-sm text-surface-600">To Pass</div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Before you start:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Make sure you have a stable internet connection</li>
                    <li>The quiz will auto-submit when time runs out</li>
                    <li>You cannot pause once started</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button onClick={startQuiz} size="lg" className="w-full">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show quiz questions
  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Timer and Progress Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-surface-600">
          Question {currentQuestion + 1} of {totalQuestions}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          timeLeft < 60 ? "bg-red-100 text-red-700" : "bg-surface-100 text-surface-700"
        }`}>
          <Clock className="w-4 h-4" />
          <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-surface-200 rounded-full mb-6">
        <div
          className="h-full bg-primary-600 rounded-full transition-all"
          style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Question */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-2">
              {question.question}
            </h2>
            <span className="text-sm text-surface-500">{question.points} points</span>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectAnswer(question._id, index)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  answers[question._id] === index
                    ? "border-primary-500 bg-primary-50"
                    : "border-surface-200 hover:border-surface-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[question._id] === index
                      ? "border-primary-500 bg-primary-500"
                      : "border-surface-300"
                  }`}>
                    {answers[question._id] === index && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-surface-800">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="text-sm text-surface-600">
              {answeredCount} of {totalQuestions} answered
            </div>

            {currentQuestion < totalQuestions - 1 ? (
              <Button
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Navigator */}
      <div className="mt-6">
        <p className="text-sm font-medium text-surface-700 mb-3">Quick Navigation</p>
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((q, index) => (
            <button
              key={q._id}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${
                currentQuestion === index
                  ? "bg-primary-600 text-white"
                  : answers[q._id] !== undefined
                  ? "bg-accent-100 text-accent-700"
                  : "bg-surface-100 text-surface-600 hover:bg-surface-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
