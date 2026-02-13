"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import {
  HelpCircle,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen,
  Clock,
  Trophy,
} from "lucide-react";

interface QuizAttempt {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    slug: string;
    quizzes: Array<{
      _id: string;
      title: string;
      passingScore: number;
    }>;
  };
  quizId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    points: number;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminQuizzesPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [passedFilter, setPassedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);

  const fetchAttempts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (passedFilter !== "all") {
        params.append("passed", passedFilter);
      }

      const res = await fetch(`/api/admin/quizzes?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setAttempts(data.attempts);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      toast.error("Failed to load quiz attempts");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, passedFilter]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const getQuizTitle = (attempt: QuizAttempt) => {
    const quiz = attempt.course.quizzes?.find(
      (q) => q._id === attempt.quizId
    );
    return quiz?.title || "Unknown Quiz";
  };

  const getQuizPassingScore = (attempt: QuizAttempt) => {
    const quiz = attempt.course.quizzes?.find(
      (q) => q._id === attempt.quizId
    );
    return quiz?.passingScore || 70;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredAttempts = attempts.filter((a) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      a.student.name.toLowerCase().includes(query) ||
      a.student.email.toLowerCase().includes(query) ||
      a.course.title.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Quiz Attempts</h1>
        <p className="text-surface-600">View student quiz submissions and results</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Total Attempts</p>
                <p className="text-2xl font-bold text-surface-900">{pagination.total}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-xl">
                <HelpCircle className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Passed</p>
                <p className="text-2xl font-bold text-green-600">
                  {attempts.filter(a => a.passed).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {attempts.filter(a => !a.passed).length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500">Avg Score</p>
                <p className="text-2xl font-bold text-surface-900">
                  {attempts.length > 0
                    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
                    : 0}%
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by student name, email, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-500" />
          <select
            value={passedFilter}
            onChange={(e) => {
              setPassedFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2.5 border border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Results</option>
            <option value="true">Passed</option>
            <option value="false">Failed</option>
          </select>
        </div>
      </div>

      {/* Attempts List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse flex gap-4">
                  <div className="w-12 h-12 bg-surface-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-200 rounded w-1/3" />
                    <div className="h-3 bg-surface-200 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAttempts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <HelpCircle className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-700">No quiz attempts found</h3>
            <p className="text-surface-500 mt-2">
              {searchQuery
                ? "Try adjusting your search query"
                : "Students haven't taken any quizzes yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => (
            <Card
              key={attempt._id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedAttempt(attempt)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                      {attempt.student.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-surface-400" />
                        {attempt.student.name}
                      </h3>
                      <p className="text-sm text-surface-500">{attempt.student.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm text-surface-600">
                          <BookOpen className="w-4 h-4" />
                          {attempt.course.title}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-surface-600">
                          <HelpCircle className="w-4 h-4" />
                          {getQuizTitle(attempt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={attempt.passed ? "success" : "danger"}
                      className="mb-2"
                    >
                      {attempt.passed ? "Passed" : "Failed"}
                    </Badge>
                    <p className="text-lg font-bold text-surface-900">
                      {attempt.score}/{attempt.maxScore} ({attempt.percentage}%)
                    </p>
                    <p className="text-sm text-surface-500 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(attempt.timeSpent)}
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                      {formatDate(attempt.completedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} attempts
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-surface-300 hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg border border-surface-300 hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Attempt Detail Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-surface-200">
              <div className="flex items-center justify-between">
                <CardTitle>Quiz Attempt Details</CardTitle>
                <button
                  onClick={() => setSelectedAttempt(null)}
                  className="p-2 hover:bg-surface-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Student Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-medium">
                  {selectedAttempt.student.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-surface-900">
                    {selectedAttempt.student.name}
                  </h3>
                  <p className="text-surface-500">{selectedAttempt.student.email}</p>
                </div>
              </div>

              {/* Quiz Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-50 rounded-xl">
                  <p className="text-sm text-surface-500">Course</p>
                  <p className="font-medium">{selectedAttempt.course.title}</p>
                </div>
                <div className="p-4 bg-surface-50 rounded-xl">
                  <p className="text-sm text-surface-500">Quiz</p>
                  <p className="font-medium">{getQuizTitle(selectedAttempt)}</p>
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-surface-50 rounded-xl text-center">
                  <p className="text-sm text-surface-500">Score</p>
                  <p className="text-2xl font-bold text-surface-900">
                    {selectedAttempt.score}/{selectedAttempt.maxScore}
                  </p>
                </div>
                <div className="p-4 bg-surface-50 rounded-xl text-center">
                  <p className="text-sm text-surface-500">Percentage</p>
                  <p className={`text-2xl font-bold ${selectedAttempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedAttempt.percentage}%
                  </p>
                </div>
                <div className="p-4 bg-surface-50 rounded-xl text-center">
                  <p className="text-sm text-surface-500">Time Spent</p>
                  <p className="text-2xl font-bold text-surface-900">
                    {formatTime(selectedAttempt.timeSpent)}
                  </p>
                </div>
              </div>

              {/* Pass/Fail Status */}
              <div className={`p-4 rounded-xl ${selectedAttempt.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-3">
                  {selectedAttempt.passed ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <div>
                    <p className={`font-semibold ${selectedAttempt.passed ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedAttempt.passed ? "Quiz Passed" : "Quiz Failed"}
                    </p>
                    <p className="text-sm text-surface-600">
                      Passing score: {getQuizPassingScore(selectedAttempt)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Answer Summary */}
              <div>
                <h4 className="font-semibold mb-3">Answer Summary</h4>
                <div className="space-y-2">
                  {selectedAttempt.answers.map((answer, index) => (
                    <div
                      key={answer.questionId}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        answer.isCorrect ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <span className="text-sm">Question {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {answer.points} pts
                        </span>
                        {answer.isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-sm text-surface-500 space-y-1">
                <p>Started: {formatDate(selectedAttempt.startedAt)}</p>
                <p>Completed: {formatDate(selectedAttempt.completedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
