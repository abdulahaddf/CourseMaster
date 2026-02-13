"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  FileText,
  Clock,
  DollarSign,
  BarChart3,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    completedEnrollments: number;
    overallCompletionRate: number;
    newUsersLast7Days: number;
    newEnrollmentsLast7Days: number;
    totalQuizAttempts: number;
    totalAssignmentSubmissions: number;
    pendingAssignments: number;
  };
  charts: {
    enrollmentsOverTime: { date: string; count: number }[];
    userRegistrations: { date: string; count: number }[];
    topCourses: {
      _id: string;
      title: string;
      category: string;
      enrollments: number;
      completions: number;
    }[];
    completionByLevel: {
      _id: string;
      total: number;
      completed: number;
    }[];
    revenueByMonth: {
      _id: string;
      revenue: number;
      enrollments: number;
    }[];
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        const result = await res.json();
        if (res.ok) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">Failed to load analytics</h3>
      </div>
    );
  }

  const { overview, charts } = data;

  // Get max value for chart scaling
  const maxEnrollment = Math.max(...charts.enrollmentsOverTime.map((d) => d.count), 1);
  const maxRevenue = Math.max(...charts.revenueByMonth.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Track platform performance and growth</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overview.totalUsers}</p>
                <p className="text-xs text-gray-500">Total Users</p>
                <p className="text-xs text-green-600">+{overview.newUsersLast7Days} this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overview.totalCourses}</p>
                <p className="text-xs text-gray-500">Total Courses</p>
                <p className="text-xs text-gray-400">{overview.publishedCourses} published</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overview.totalEnrollments}</p>
                <p className="text-xs text-gray-500">Enrollments</p>
                <p className="text-xs text-green-600">+{overview.newEnrollmentsLast7Days} this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overview.overallCompletionRate}%</p>
                <p className="text-xs text-gray-500">Completion Rate</p>
                <p className="text-xs text-gray-400">{overview.completedEnrollments} completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{overview.totalQuizAttempts}</p>
                <p className="text-xs text-gray-500">Quiz Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{overview.totalAssignmentSubmissions}</p>
                <p className="text-xs text-gray-500">Assignment Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{overview.pendingAssignments}</p>
                <p className="text-xs text-gray-500">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollments Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enrollments Over Time (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {charts.enrollmentsOverTime.slice(-30).map((day, index) => (
                <div
                  key={day.date}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors rounded-t cursor-pointer group relative"
                  style={{
                    height: `${(day.count / maxEnrollment) * 100}%`,
                    minHeight: day.count > 0 ? "4px" : "2px",
                    backgroundColor: day.count > 0 ? undefined : "#e5e7eb",
                  }}
                  title={`${day.date}: ${day.count} enrollments`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {day.date}: {day.count}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-4 px-4">
              {charts.revenueByMonth.map((month) => (
                <div key={month._id} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 hover:bg-green-600 transition-colors rounded-t cursor-pointer group relative"
                    style={{
                      height: `${(month.revenue / maxRevenue) * 200}px`,
                      minHeight: month.revenue > 0 ? "20px" : "4px",
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      ${month.revenue.toLocaleString()} ({month.enrollments} sales)
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{month._id}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses & Completion by Level */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Courses by Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {charts.topCourses.length > 0 ? (
                charts.topCourses.map((course, index) => (
                  <div key={course._id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{course.enrollments}</p>
                      <p className="text-xs text-gray-500">
                        {course.completions} completed
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No enrollment data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completion by Level */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completion Rate by Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {charts.completionByLevel.length > 0 ? (
                charts.completionByLevel.map((level) => {
                  const rate = level.total > 0 ? Math.round((level.completed / level.total) * 100) : 0;
                  return (
                    <div key={level._id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900">{level._id}</span>
                        <span className="text-gray-500">
                          {level.completed}/{level.total} ({rate}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No completion data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Registrations Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Registrations (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-end gap-1">
            {charts.userRegistrations.slice(-30).map((day) => {
              const maxReg = Math.max(...charts.userRegistrations.map((d) => d.count), 1);
              return (
                <div
                  key={day.date}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 transition-colors rounded-t cursor-pointer group relative"
                  style={{
                    height: `${(day.count / maxReg) * 100}%`,
                    minHeight: day.count > 0 ? "4px" : "2px",
                    backgroundColor: day.count > 0 ? undefined : "#e5e7eb",
                  }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {day.date}: {day.count} users
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
