"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  Badge,
} from "@/components/ui";
import {
  Users,
  Search,
  Shield,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { UserActions } from "@/components/admin/UserActions";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    instructors: 0,
    admins: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (roleFilter !== "all") {
        params.append("role", roleFilter);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, roleFilter, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const [allRes, studentRes, instructorRes, adminRes] = await Promise.all([
        fetch("/api/admin/users?limit=1"),
        fetch("/api/admin/users?role=student&limit=1"),
        fetch("/api/admin/users?role=instructor&limit=1"),
        fetch("/api/admin/users?role=admin&limit=1"),
      ]);

      const [allData, studentData, instructorData, adminData] = await Promise.all([
        allRes.json(),
        studentRes.json(),
        instructorRes.json(),
        adminRes.json(),
      ]);

      setStats({
        totalUsers: allData.pagination?.total || 0,
        students: studentData.pagination?.total || 0,
        instructors: instructorData.pagination?.total || 0,
        admins: adminData.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Users</h1>
        <p className="text-surface-500 mt-1">Manage platform users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-surface-900">
              {stats.totalUsers}
            </p>
            <p className="text-sm text-surface-500">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-primary-600">
              {stats.students}
            </p>
            <p className="text-sm text-surface-500">Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-accent-600">
              {stats.instructors}
            </p>
            <p className="text-sm text-surface-500">Instructors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{stats.admins}</p>
            <p className="text-sm text-surface-500">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </form>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-500" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2.5 border border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <Card>
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-surface-500">Loading users...</p>
          </div>
        </Card>
      ) : users.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-surface-500">
                    User
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-surface-500">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-surface-500">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-surface-500">
                    Joined
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-surface-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="font-medium text-surface-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-surface-600">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "default"
                            : user.role === "instructor"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-surface-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <UserActions user={user} onUpdate={handleRefresh} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-16">
          <Users className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-surface-900 mb-2">
            No users found
          </h3>
          <p className="text-surface-500">
            Try adjusting your filters to find users
          </p>
        </Card>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-surface-300 hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg border border-surface-300 hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
