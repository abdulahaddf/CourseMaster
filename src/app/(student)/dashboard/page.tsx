import Link from "next/link";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent, Progress, Badge, Button } from "@/components/ui";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  ArrowRight,
  Target,
  CheckCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

async function getDashboardData(userId: string) {
  await connectDB();

  const enrollments = await Enrollment.find({ student: userId })
    .populate({
      path: "course",
      select: "title slug thumbnail instructorName category level totalLessons totalDuration",
    })
    .sort({ enrolledAt: -1 })
    .lean();

  const stats = {
    totalCourses: enrollments.length,
    completedCourses: enrollments.filter((e) => e.isCompleted).length,
    inProgressCourses: enrollments.filter((e) => !e.isCompleted && e.overallProgress > 0).length,
    totalLessonsCompleted: enrollments.reduce((acc, e) => acc + e.completedLessons, 0),
  };

  return {
    enrollments: JSON.parse(JSON.stringify(enrollments)),
    stats,
  };
}

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  const { enrollments, stats } = await getDashboardData(user!._id.toString());

  const recentEnrollments = enrollments.slice(0, 4);
  const inProgressCourses = enrollments.filter(
    (e: { isCompleted: boolean; overallProgress: number }) => !e.isCompleted && e.overallProgress > 0
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-hero rounded-2xl p-6 lg:p-8 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome back, {user!.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-primary-100 mb-4">
          Continue your learning journey and achieve your goals.
        </p>
        <Link href="/courses">
          <Button
            className="bg-white text-primary-700 hover:bg-primary-50"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Explore Courses
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">
                  {stats.totalCourses}
                </p>
                <p className="text-sm text-surface-500">Enrolled Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100">
                <CheckCircle className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">
                  {stats.completedCourses}
                </p>
                <p className="text-sm text-surface-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">
                  {stats.inProgressCourses}
                </p>
                <p className="text-sm text-surface-500">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">
                  {stats.totalLessonsCompleted}
                </p>
                <p className="text-sm text-surface-500">Lessons Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      {inProgressCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-surface-900">
              Continue Learning
            </h2>
            <Link
              href="/dashboard/courses"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {inProgressCourses.slice(0, 2).map((enrollment: {
              _id: string;
              course: {
                _id: string;
                slug: string;
                title: string;
                thumbnail?: string;
                instructorName: string;
                category: string;
              };
              overallProgress: number;
              completedLessons: number;
              totalLessons: number;
            }) => (
              <Link
                key={enrollment._id}
                href={`/dashboard/courses/${enrollment.course.slug}`}
              >
                <Card hover className="overflow-hidden">
                  <div className="flex">
                    {/* Thumbnail */}
                    <div className="w-32 h-32 shrink-0 bg-surface-100">
                      {enrollment.course.thumbnail ? (
                        <img
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-primary-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-4">
                      <Badge size="sm" className="mb-2">
                        {enrollment.course.category}
                      </Badge>
                      <h3 className="font-semibold text-surface-900 line-clamp-1 mb-1">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-sm text-surface-500 mb-3">
                        {enrollment.course.instructorName}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-surface-600">
                            {enrollment.completedLessons} / {enrollment.totalLessons}{" "}
                            lessons
                          </span>
                          <span className="font-medium text-primary-600">
                            {enrollment.overallProgress}%
                          </span>
                        </div>
                        <Progress
                          value={enrollment.overallProgress}
                          size="sm"
                          variant={
                            enrollment.overallProgress === 100
                              ? "success"
                              : "default"
                          }
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Enrollments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-surface-900">
            My Courses
          </h2>
          <Link
            href="/dashboard/courses"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all
          </Link>
        </div>

        {recentEnrollments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentEnrollments.map((enrollment: {
              _id: string;
              course: {
                _id: string;
                slug: string;
                title: string;
                thumbnail?: string;
                instructorName: string;
                category: string;
                level: string;
              };
              overallProgress: number;
              isCompleted: boolean;
            }) => (
              <Link
                key={enrollment._id}
                href={`/dashboard/courses/${enrollment.course.slug}`}
              >
                <Card hover className="h-full">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-surface-100">
                    {enrollment.course.thumbnail ? (
                      <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-primary-400" />
                      </div>
                    )}
                    {enrollment.isCompleted && (
                      <Badge
                        variant="success"
                        className="absolute top-2 right-2"
                      >
                        Completed
                      </Badge>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-200">
                      <div
                        className="h-full bg-primary-600"
                        style={{ width: `${enrollment.overallProgress}%` }}
                      />
                    </div>
                  </div>

                  <CardContent className="pt-4">
                    <p className="text-xs text-surface-500 mb-1">
                      {enrollment.course.category} • {enrollment.course.level}
                    </p>
                    <h3 className="font-semibold text-surface-900 line-clamp-2 mb-2">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-surface-500">
                      {enrollment.course.instructorName}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 mb-2">
              No courses yet
            </h3>
            <p className="text-surface-500 mb-4">
              Start learning by enrolling in your first course
            </p>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
