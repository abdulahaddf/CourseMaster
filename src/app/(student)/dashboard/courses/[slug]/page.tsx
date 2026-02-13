import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { getCurrentUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Badge,
  Avatar,
} from "@/components/ui";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Play,
  ChevronRight,
  Award,
  ArrowLeft,
  FileText,
  HelpCircle,
} from "lucide-react";

async function getCourseWithProgress(slug: string, userId: string) {
  await connectDB();

  const course = await Course.findOne({ slug, isPublished: true }).lean();

  if (!course) {
    return null;
  }

  const enrollment = await Enrollment.findOne({
    student: userId,
    course: course._id,
  }).lean();

  if (!enrollment) {
    return null;
  }

  return {
    course: JSON.parse(JSON.stringify(course)),
    enrollment: JSON.parse(JSON.stringify(enrollment)),
  };
}

// Helper function to check if a lesson is completed
function isLessonCompleted(
  enrollment: { progress?: Array<{ lessons?: Array<{ lessonId: string; completed: boolean }> }> },
  lessonId: string
): boolean {
  if (!enrollment.progress) return false;
  
  for (const moduleProgress of enrollment.progress) {
    if (!moduleProgress.lessons) continue;
    for (const lessonProgress of moduleProgress.lessons) {
      if (lessonProgress.lessonId === lessonId && lessonProgress.completed) {
        return true;
      }
    }
  }
  return false;
}

export default async function CoursePlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  const { slug } = await params;
  const data = await getCourseWithProgress(slug, user!._id.toString());

  if (!data) {
    notFound();
  }

  const { course, enrollment } = data;

  // Find next lesson to continue
  let nextLesson: { moduleIndex: number; lessonIndex: number; lesson: { _id: string; title: string } } | null = null;
  for (let i = 0; i < course.modules.length; i++) {
    for (let j = 0; j < course.modules[i].lessons.length; j++) {
      const lesson = course.modules[i].lessons[j];
      const isCompleted = isLessonCompleted(enrollment, lesson._id);
      if (!isCompleted && !nextLesson) {
        nextLesson = {
          moduleIndex: i,
          lessonIndex: j,
          lesson,
        };
        break;
      }
    }
    if (nextLesson) break;
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/courses"
        className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Courses
      </Link>

      {/* Course Header */}
      <div className="bg-gradient-hero rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Badge className="mb-3 bg-white/20 text-white">
              {course.category}
            </Badge>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              {course.title}
            </h1>
            <p className="text-primary-100 mb-4">
              by {course.instructorName}
            </p>

            {/* Progress */}
            <div className="space-y-2 max-w-md">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {enrollment.completedLessons} of {course.totalLessons} lessons
                  completed
                </span>
                <span className="font-semibold">
                  {enrollment.overallProgress}%
                </span>
              </div>
              <Progress
                value={enrollment.overallProgress}
                size="default"
                variant={enrollment.isCompleted ? "success" : "default"}
                className="bg-white/20"
              />
            </div>
          </div>

          {/* Continue Button */}
          {nextLesson && (
            <div className="flex items-center">
              <Link
                href={`/dashboard/courses/${slug}/lessons/${nextLesson.lesson._id}`}
                className="flex items-center gap-3 px-6 py-4 bg-white text-primary-700 rounded-xl hover:bg-primary-50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Play className="w-5 h-5 text-primary-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-primary-500">Continue Learning</p>
                  <p className="font-semibold line-clamp-1">
                    {nextLesson.lesson.title}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-primary-400" />
              </Link>
            </div>
          )}

          {enrollment.isCompleted && (
            <div className="flex items-center">
              <div className="flex items-center gap-3 px-6 py-4 bg-accent-500 text-white rounded-xl">
                <Award className="w-8 h-8" />
                <div>
                  <p className="font-semibold">Course Completed!</p>
                  <p className="text-sm text-accent-100">
                    Congratulations on finishing the course
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Modules List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-surface-900">
            Course Content
          </h2>

          {course.modules.map(
            (
              module: {
                _id: string;
                title: string;
                lessons: Array<{
                  _id: string;
                  title: string;
                  duration: number;
                  type: string;
                  isFree: boolean;
                }>;
              },
              moduleIndex: number
            ) => {
              const completedInModule = module.lessons.filter((l) =>
                isLessonCompleted(enrollment, l._id)
              ).length;
              const moduleProgress = Math.round(
                (completedInModule / module.lessons.length) * 100
              );

              return (
                <Card key={module._id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 font-semibold text-sm">
                          {moduleIndex + 1}
                        </div>
                        <CardTitle className="text-base">
                          {module.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-surface-500">
                        <span>
                          {completedInModule}/{module.lessons.length}
                        </span>
                        {moduleProgress === 100 && (
                          <CheckCircle className="w-4 h-4 text-accent-500" />
                        )}
                      </div>
                    </div>
                    <Progress value={moduleProgress} size="sm" className="mt-2" />
                  </CardHeader>
                  <CardContent className="pt-2">
                    <ul className="divide-y divide-surface-100">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isCompleted = isLessonCompleted(
                          enrollment,
                          lesson._id
                        );
                        const isCurrent =
                          nextLesson?.lesson._id === lesson._id;

                        return (
                          <li key={lesson._id}>
                            <Link
                              href={`/dashboard/courses/${slug}/lessons/${lesson._id}`}
                              className={`flex items-center gap-3 py-3 hover:bg-surface-50 -mx-4 px-4 transition-colors ${
                                isCurrent ? "bg-primary-50" : ""
                              }`}
                            >
                              {/* Status Icon */}
                              <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                  isCompleted
                                    ? "bg-accent-100 text-accent-600"
                                    : isCurrent
                                    ? "bg-primary-100 text-primary-600"
                                    : "bg-surface-100 text-surface-400"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : isCurrent ? (
                                  <Play className="w-3 h-3 ml-0.5" />
                                ) : (
                                  <span className="text-xs font-medium">
                                    {lessonIndex + 1}
                                  </span>
                                )}
                              </div>

                              {/* Lesson Info */}
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-medium truncate ${
                                    isCompleted
                                      ? "text-surface-500"
                                      : "text-surface-900"
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-surface-400">
                                  <span className="capitalize">
                                    {lesson.type}
                                  </span>
                                  <span>•</span>
                                  <span>{lesson.duration} min</span>
                                </div>
                              </div>

                              {/* Right Icon */}
                              <ChevronRight
                                className={`w-4 h-4 ${
                                  isCurrent
                                    ? "text-primary-600"
                                    : "text-surface-300"
                                }`}
                              />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              );
            }
          )}

          {/* Assignments Section */}
          {course.assignments && course.assignments.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                Assignments ({course.assignments.length})
              </h2>
              <Card>
                <CardContent className="py-4">
                  <ul className="divide-y divide-surface-100">
                    {course.assignments.map((assignment: {
                      _id: string;
                      title: string;
                      description: string;
                      moduleId: string;
                      maxScore: number;
                    }) => {
                      const module = course.modules.find(
                        (m: { _id: string }) => m._id === assignment.moduleId
                      );
                      return (
                        <li key={assignment._id}>
                          <Link
                            href={`/dashboard/courses/${slug}/assignment?assignmentId=${assignment._id}&moduleId=${assignment.moduleId}`}
                            className="flex items-center gap-3 py-3 hover:bg-surface-50 -mx-4 px-4 transition-colors"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-surface-900 truncate">
                                {assignment.title}
                              </p>
                              <p className="text-xs text-surface-500">
                                {module?.title || "General"} • Max Score: {assignment.maxScore}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-surface-300" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quizzes Section */}
          {course.quizzes && course.quizzes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary-600" />
                Quizzes ({course.quizzes.length})
              </h2>
              <Card>
                <CardContent className="py-4">
                  <ul className="divide-y divide-surface-100">
                    {course.quizzes.map((quiz: {
                      _id: string;
                      title: string;
                      moduleId: string;
                      questions: Array<unknown>;
                      passingScore: number;
                      timeLimit: number;
                    }) => {
                      const module = course.modules.find(
                        (m: { _id: string }) => m._id === quiz.moduleId
                      );
                      return (
                        <li key={quiz._id}>
                          <Link
                            href={`/dashboard/courses/${slug}/quiz?quizId=${quiz._id}&moduleId=${quiz.moduleId}`}
                            className="flex items-center gap-3 py-3 hover:bg-surface-50 -mx-4 px-4 transition-colors"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                              <HelpCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-surface-900 truncate">
                                {quiz.title}
                              </p>
                              <p className="text-xs text-surface-500">
                                {module?.title || "General"} • {quiz.questions?.length || 0} questions • {quiz.timeLimit} min
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-surface-300" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={course.instructorAvatar}
                  alt={course.instructorName}
                  size="default"
                />
                <div>
                  <p className="text-sm text-surface-500">Instructor</p>
                  <p className="font-medium text-surface-900">
                    {course.instructorName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-surface-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-surface-900">
                    {course.totalLessons}
                  </p>
                  <p className="text-xs text-surface-500">Lessons</p>
                </div>
                <div className="text-center p-3 bg-surface-50 rounded-lg">
                  <Clock className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                  <p className="text-lg font-semibold text-surface-900">
                    {Math.round(course.totalDuration / 60)}h
                  </p>
                  <p className="text-xs text-surface-500">Duration</p>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-100">
                <p className="text-sm text-surface-500 mb-1">Enrolled on</p>
                <p className="font-medium text-surface-900">
                  {new Date(enrollment.enrolledAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {enrollment.isCompleted && enrollment.completedAt && (
                <div className="pt-4 border-t border-surface-100">
                  <p className="text-sm text-surface-500 mb-1">Completed on</p>
                  <p className="font-medium text-accent-600">
                    {new Date(enrollment.completedAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    enrollment.overallProgress >= 25
                      ? "bg-amber-100 text-amber-600"
                      : "bg-surface-100 text-surface-400"
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-surface-900">Getting Started</p>
                  <p className="text-sm text-surface-500">
                    Complete 25% of the course
                  </p>
                </div>
                {enrollment.overallProgress >= 25 && (
                  <CheckCircle className="w-5 h-5 text-accent-500 ml-auto" />
                )}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    enrollment.overallProgress >= 50
                      ? "bg-amber-100 text-amber-600"
                      : "bg-surface-100 text-surface-400"
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-surface-900">Halfway There</p>
                  <p className="text-sm text-surface-500">
                    Complete 50% of the course
                  </p>
                </div>
                {enrollment.overallProgress >= 50 && (
                  <CheckCircle className="w-5 h-5 text-accent-500 ml-auto" />
                )}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    enrollment.isCompleted
                      ? "bg-accent-100 text-accent-600"
                      : "bg-surface-100 text-surface-400"
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-surface-900">Course Master</p>
                  <p className="text-sm text-surface-500">
                    Complete 100% of the course
                  </p>
                </div>
                {enrollment.isCompleted && (
                  <CheckCircle className="w-5 h-5 text-accent-500 ml-auto" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
