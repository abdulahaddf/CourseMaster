import Link from "next/link";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { Card, CardContent, Badge } from "@/components/ui";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  ShoppingCart,
  Star,
} from "lucide-react";

async function getAdminStats() {
  await connectDB();

  // Get counts
  const [totalUsers, totalCourses, totalEnrollments, recentUsers, recentEnrollments] =
    await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role avatar createdAt").lean(),
      Enrollment.find()
        .sort({ enrolledAt: -1 })
        .limit(5)
        .populate("student", "name email")
        .populate("course", "title slug")
        .lean(),
    ]);

  // Get revenue
  const revenueResult = await Enrollment.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$amountPaid" },
      },
    },
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  // Get instructors count
  const totalInstructors = await User.countDocuments({ role: "instructor" });

  // Get course stats
  const publishedCourses = await Course.countDocuments({ isPublished: true });

  return {
    stats: {
      totalUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalRevenue,
      totalInstructors,
    },
    recentUsers: JSON.parse(JSON.stringify(recentUsers)),
    recentEnrollments: JSON.parse(JSON.stringify(recentEnrollments)),
  };
}

export default async function AdminDashboardPage() {
  const { stats, recentUsers, recentEnrollments } = await getAdminStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">
          Admin Dashboard
        </h1>
        <p className="text-surface-500 mt-1">
          Overview of your platform&lsquo;s performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-500 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-surface-900">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2 text-sm text-accent-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+12%</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-500 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-surface-900">
                  {stats.totalCourses}
                </p>
                <p className="text-sm text-surface-500 mt-2">
                  {stats.publishedCourses} published
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100">
                <BookOpen className="h-6 w-6 text-accent-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-surface-900">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2 text-sm text-accent-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+23%</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-500 mb-1">Enrollments</p>
                <p className="text-3xl font-bold text-surface-900">
                  {stats.totalEnrollments.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2 text-sm text-accent-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+18%</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <div className="flex items-center justify-between p-6 border-b border-surface-100">
            <h2 className="text-lg font-semibold text-surface-900">
              Recent Users
            </h2>
            <Link
              href="/admin/users"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <CardContent className="py-4">
            {recentUsers.length > 0 ? (
              <ul className="divide-y divide-surface-100">
                {recentUsers.map(
                  (user: {
                    _id: string;
                    name: string;
                    email: string;
                    role: string;
                    createdAt: string;
                  }) => (
                    <li
                      key={user._id}
                      className="py-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-surface-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "default"
                            : user.role === "instructor"
                            ? "secondary"
                            : "outline"
                        }
                        size="sm"
                      >
                        {user.role}
                      </Badge>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="text-center py-8">
                <UserPlus className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                <p className="text-sm text-surface-500">No users yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <div className="flex items-center justify-between p-6 border-b border-surface-100">
            <h2 className="text-lg font-semibold text-surface-900">
              Recent Enrollments
            </h2>
            <Link
              href="/admin/transactions"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
          <CardContent className="py-4">
            {recentEnrollments.length > 0 ? (
              <ul className="divide-y divide-surface-100">
                {recentEnrollments.map(
                  (enrollment: {
                    _id: string;
                    student: { name: string; email: string };
                    course: { title: string; slug: string };
                    amountPaid: number;
                    enrolledAt: string;
                  }) => (
                    <li
                      key={enrollment._id}
                      className="py-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent-600">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-surface-900 truncate">
                          {enrollment.student.name}
                        </p>
                        <p className="text-sm text-surface-500 truncate">
                          {enrollment.course.title}
                        </p>
                      </div>
                      <span className="font-semibold text-accent-600">
                        ${enrollment.amountPaid || 0}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-10 h-10 text-surface-300 mx-auto mb-2" />
                <p className="text-sm text-surface-500">No enrollments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-6 border-b border-surface-100">
          <h2 className="text-lg font-semibold text-surface-900">
            Quick Actions
          </h2>
        </div>
        <CardContent className="py-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-4 rounded-xl border border-surface-200 hover:border-primary-200 hover:bg-primary-50 transition-colors"
            >
              <Users className="w-8 h-8 text-primary-600" />
              <div>
                <p className="font-medium text-surface-900">Manage Users</p>
                <p className="text-sm text-surface-500">
                  {stats.totalUsers} users
                </p>
              </div>
            </Link>

            <Link
              href="/admin/courses"
              className="flex items-center gap-3 p-4 rounded-xl border border-surface-200 hover:border-accent-200 hover:bg-accent-50 transition-colors"
            >
              <BookOpen className="w-8 h-8 text-accent-600" />
              <div>
                <p className="font-medium text-surface-900">Manage Courses</p>
                <p className="text-sm text-surface-500">
                  {stats.totalCourses} courses
                </p>
              </div>
            </Link>

            <Link
              href="/admin/instructors"
              className="flex items-center gap-3 p-4 rounded-xl border border-surface-200 hover:border-amber-200 hover:bg-amber-50 transition-colors"
            >
              <Star className="w-8 h-8 text-amber-600" />
              <div>
                <p className="font-medium text-surface-900">Instructors</p>
                <p className="text-sm text-surface-500">
                  {stats.totalInstructors} instructors
                </p>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 p-4 rounded-xl border border-surface-200 hover:border-green-200 hover:bg-green-50 transition-colors"
            >
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-surface-900">Revenue</p>
                <p className="text-sm text-surface-500">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
