import Link from "next/link";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import { getCurrentUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  Progress,
  Badge,
  Input,
  Select,
} from "@/components/ui";
import { BookOpen, Search, Clock, PlayCircle } from "lucide-react";

interface SearchParams {
  status?: string;
  search?: string;
}

async function getEnrolledCourses(userId: string, searchParams: SearchParams) {
  await connectDB();

  const enrollments = await Enrollment.find({ student: userId })
    .populate({
      path: "course",
      select:
        "title slug thumbnail instructorName category level totalLessons totalDuration",
    })
    .sort({ enrolledAt: -1 })
    .lean();

  let filtered = enrollments;

  // Filter by status
  if (searchParams.status === "completed") {
    filtered = filtered.filter((e) => e.isCompleted);
  } else if (searchParams.status === "in-progress") {
    filtered = filtered.filter((e) => !e.isCompleted && e.overallProgress > 0);
  } else if (searchParams.status === "not-started") {
    filtered = filtered.filter((e) => e.overallProgress === 0);
  }

  // Filter by search
  if (searchParams.search) {
    const searchLower = searchParams.search.toLowerCase();
    filtered = filtered.filter((e) => {
      const course = e.course as unknown as { 
        title: string; 
        instructorName: string; 
        category: string;
      };
      return (
        course.title?.toLowerCase().includes(searchLower) ||
        course.instructorName?.toLowerCase().includes(searchLower) ||
        course.category?.toLowerCase().includes(searchLower)
      );
    });
  }

  return JSON.parse(JSON.stringify(filtered));
}

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const enrollments = await getEnrolledCourses(user!._id.toString(), params);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">My Courses</h1>
        <p className="text-surface-500 mt-1">
          Track your progress and continue learning
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                name="search"
                placeholder="Search your courses..."
                defaultValue={params.search}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select name="status" defaultValue={params.status || ""}>
                <option value="">All Courses</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="not-started">Not Started</option>
              </Select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Filter
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {enrollments.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(
            (enrollment: {
              _id: string;
              course: {
                _id: string;
                slug: string;
                title: string;
                thumbnail?: string;
                instructorName: string;
                category: string;
                level: string;
                totalLessons: number;
                totalDuration: number;
              };
              overallProgress: number;
              completedLessons: number;
              isCompleted: boolean;
              enrolledAt: string;
            }) => (
              <Link
                key={enrollment._id}
                href={`/dashboard/courses/${enrollment.course.slug}`}
              >
                <Card hover className="h-full group">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-surface-100 overflow-hidden">
                    {enrollment.course.thumbnail ? (
                      <img
                        src={enrollment.course.thumbnail}
                        alt={enrollment.course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-primary-400" />
                      </div>
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <PlayCircle className="w-8 h-8 text-primary-600" />
                      </div>
                    </div>

                    {/* Status Badge */}
                    {enrollment.isCompleted ? (
                      <Badge
                        variant="success"
                        className="absolute top-3 right-3"
                      >
                        Completed
                      </Badge>
                    ) : enrollment.overallProgress > 0 ? (
                      <Badge
                        variant="default"
                        className="absolute top-3 right-3"
                      >
                        In Progress
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="absolute top-3 right-3"
                      >
                        Not Started
                      </Badge>
                    )}

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-surface-200">
                      <div
                        className={`h-full transition-all ${
                          enrollment.isCompleted
                            ? "bg-accent-500"
                            : "bg-primary-600"
                        }`}
                        style={{ width: `${enrollment.overallProgress}%` }}
                      />
                    </div>
                  </div>

                  <CardContent className="pt-4">
                    {/* Category & Level */}
                    <div className="flex items-center gap-2 text-xs text-surface-500 mb-2">
                      <span>{enrollment.course.category}</span>
                      <span>•</span>
                      <span className="capitalize">
                        {enrollment.course.level}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-surface-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                      {enrollment.course.title}
                    </h3>

                    {/* Instructor */}
                    <p className="text-sm text-surface-500 mb-4">
                      {enrollment.course.instructorName}
                    </p>

                    {/* Progress Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-surface-600">
                          <BookOpen className="w-4 h-4" />
                          <span>
                            {enrollment.completedLessons} /{" "}
                            {enrollment.course.totalLessons} lessons
                          </span>
                        </div>
                        <span className="font-semibold text-primary-600">
                          {enrollment.overallProgress}%
                        </span>
                      </div>
                      <Progress
                        value={enrollment.overallProgress}
                        size="sm"
                        variant={
                          enrollment.isCompleted ? "success" : "default"
                        }
                      />
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1 text-xs text-surface-400 mt-3">
                      <Clock className="w-3 h-3" />
                      <span>
                        {Math.round(enrollment.course.totalDuration / 60)} hours
                        total
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          )}
        </div>
      ) : (
        <Card className="text-center py-16">
          <BookOpen className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-surface-900 mb-2">
            {params.search || params.status
              ? "No courses found"
              : "No courses yet"}
          </h3>
          <p className="text-surface-500 mb-6 max-w-md mx-auto">
            {params.search || params.status
              ? "Try adjusting your filters to find what you're looking for"
              : "Start your learning journey by exploring our course catalog"}
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            Browse Courses
          </Link>
        </Card>
      )}
    </div>
  );
}
