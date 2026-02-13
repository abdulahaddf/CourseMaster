"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
} from "@/components/ui";
import {
  Users,
  Search,
  BookOpen,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Calendar,
  BarChart3,
  User,
} from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Batch {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  category: string;
  batches?: Batch[];
}

interface Enrollment {
  _id: string;
  student: Student;
  course: Course;
  batch?: string;
  enrolledAt: string;
  isCompleted: boolean;
  overallProgress: number;
  completedLessons: number;
  lastAccessedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Stats {
  total: number;
  active: number;
  completed: number;
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEnrollments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (courseFilter !== "all") {
        params.append("courseId", courseFilter);
      }

      if (batchFilter !== "all") {
        params.append("batchId", batchFilter);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/admin/enrollments?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setEnrollments(data.enrollments);
      setCourses(data.courses);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, courseFilter, batchFilter, searchQuery]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchEnrollments();
  };

  const selectedCourse = courses.find((c) => c._id === courseFilter);
  const availableBatches = selectedCourse?.batches || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBatchName = (enrollment: Enrollment) => {
    if (!enrollment.batch) return null;
    const course = enrollment.course;
    const batch = course.batches?.find((b) => b._id === enrollment.batch);
    return batch?.name || "Unknown Batch";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
        <p className="text-gray-600 mt-1">View and manage student enrollments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-500">Active (In Progress)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by student name, email, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value);
                  setBatchFilter("all");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Courses</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>

              {availableBatches.length > 0 && (
                <select
                  value={batchFilter}
                  onChange={(e) => {
                    setBatchFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Batches</option>
                  {availableBatches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      {isLoading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Loading enrollments...</p>
          </CardContent>
        </Card>
      ) : enrollments.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">
                    Student
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">
                    Course
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">
                    Batch
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">
                    Progress
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">
                    Enrolled
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr
                    key={enrollment._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {enrollment.student.avatar ? (
                            <img
                              src={enrollment.student.avatar}
                              alt={enrollment.student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {enrollment.student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {enrollment.student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded bg-gray-100 overflow-hidden shrink-0">
                          {enrollment.course.thumbnail ? (
                            <img
                              src={enrollment.course.thumbnail}
                              alt={enrollment.course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/courses/${enrollment.course.slug}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {enrollment.course.title}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {enrollment.course.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getBatchName(enrollment) ? (
                        <Badge variant="secondary">
                          <GraduationCap className="w-3 h-3 mr-1" />
                          {getBatchName(enrollment)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${enrollment.overallProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {enrollment.overallProgress}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {enrollment.completedLessons} lessons completed
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      {enrollment.isCompleted ? (
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <Clock className="w-3 h-3 mr-1" />
                          In Progress
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(enrollment.enrolledAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {enrollment.lastAccessedAt ? (
                        <span className="text-sm text-gray-600">
                          {formatDate(enrollment.lastAccessedAt)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} enrollments
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.pages}
                  className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="text-center py-16">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No enrollments found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters to find enrollments
          </p>
        </Card>
      )}
    </div>
  );
}
