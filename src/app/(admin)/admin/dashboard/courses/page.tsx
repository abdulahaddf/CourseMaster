import Link from "next/link";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { DeleteCourseButton } from "@/components/admin/DeleteCourseButton";
import {
  Card,
  CardContent,
  Badge,
  Input,
  Select,
} from "@/components/ui";
import {
  BookOpen,
  Search,
  Edit,
  Eye,
  Users,
  Star,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";

interface SearchParams {
  status?: string;
  search?: string;
  category?: string;
}

async function getCourses(searchParams: SearchParams) {
  await connectDB();

  const query: Record<string, unknown> = {};

  if (searchParams.status === "published") {
    query.isPublished = true;
  } else if (searchParams.status === "draft") {
    query.isPublished = false;
  }

  if (searchParams.category) {
    query.category = searchParams.category;
  }

  // Run all queries in parallel to prevent N+1 problem
  const [courses, totalCourses, publishedCourses, draftCourses] = await Promise.all([
    Course.find(query)
      .sort({ createdAt: -1 })
      .populate("instructor", "name email")
      .lean(),
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    Course.countDocuments({ isPublished: false }),
  ]);

  // Filter by search (in-memory)
  let filteredCourses = courses;
  if (searchParams.search) {
    const searchLower = searchParams.search.toLowerCase();
    filteredCourses = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(searchLower) ||
        c.instructorName.toLowerCase().includes(searchLower)
    );
  }

  // Get enrollment counts using aggregation (single query for all courses)
  const courseIds = filteredCourses.map((c) => c._id);
  const enrollmentCounts = await Enrollment.aggregate([
    { $match: { course: { $in: courseIds } } },
    { $group: { _id: "$course", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(
    enrollmentCounts.map((e) => [e._id.toString(), e.count])
  );

  return {
    courses: filteredCourses.map((course) => ({
      ...JSON.parse(JSON.stringify(course)),
      enrollmentCount: countMap.get(course._id.toString()) || 0,
    })),
    stats: { totalCourses, publishedCourses, draftCourses },
  };
}

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { courses, stats } = await getCourses(params);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Courses</h1>
          <p className="text-surface-500 mt-1">Manage all platform courses</p>
        </div>
        <Link
          href="/admin/dashboard/courses/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-surface-900">
              {stats.totalCourses}
            </p>
            <p className="text-sm text-surface-500">Total Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-accent-600">
              {stats.publishedCourses}
            </p>
            <p className="text-sm text-surface-500">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-amber-600">
              {stats.draftCourses}
            </p>
            <p className="text-sm text-surface-500">Drafts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                name="search"
                placeholder="Search courses..."
                defaultValue={params.search}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                name="status"
                defaultValue={params.status || ""}
                options={[
                  { value: "", label: "All Status" },
                  { value: "published", label: "Published" },
                  { value: "draft", label: "Draft" },
                ]}
              />
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

      {/* Courses Table */}
      {courses.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-surface-500">
                    Course
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-surface-500">
                    Instructor
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-surface-500">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-surface-500">
                    Students
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-surface-500">
                    Rating
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-surface-500">
                    Price
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-surface-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map(
                  (course: {
                    _id: string;
                    slug: string;
                    title: string;
                    thumbnail?: string;
                    instructorName: string;
                    category: string;
                    isPublished: boolean;
                    price: number;
                    enrollmentCount: number;
                    averageRating: number;
                  }) => (
                    <tr
                      key={course._id}
                      className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-lg bg-surface-100 overflow-hidden shrink-0">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-primary-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-surface-900 line-clamp-1">
                              {course.title}
                            </h3>
                            <p className="text-sm text-surface-500">
                              {course.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-surface-600">
                        {course.instructorName}
                      </td>
                      <td className="py-4 px-6">
                        {course.isPublished ? (
                          <Badge variant="success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-surface-600">
                          <Users className="w-4 h-4" />
                          <span>{course.enrollmentCount}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-surface-600">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span>
                            {course.averageRating?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-surface-900">
                          ${course.price}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/courses/${course.slug}`}
                            className="p-2 text-surface-400 hover:text-surface-600 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/dashboard/courses/${course.slug}/edit`}
                            className="p-2 text-surface-400 hover:text-surface-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteCourseButton slug={course.slug} title={course.title} />
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-16">
          <BookOpen className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-surface-900 mb-2">
            No courses found
          </h3>
          <p className="text-surface-500">
            Try adjusting your filters to find courses
          </p>
        </Card>
      )}
    </div>
  );
}
