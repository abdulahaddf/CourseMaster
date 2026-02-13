"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Badge,
} from "@/components/ui";
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen,
} from "lucide-react";

interface Submission {
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
    assignments: Array<{
      _id: string;
      title: string;
      maxScore: number;
    }>;
  };
  assignmentId: string;
  moduleId: string;
  submissionType: "link" | "text";
  content: string;
  submittedAt: string;
  status: "pending" | "graded";
  grade?: number;
  feedback?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminAssignmentsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const res = await fetch(`/api/admin/assignments?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setSubmissions(data.submissions);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const getAssignmentTitle = (submission: Submission) => {
    const assignment = submission.course?.assignments?.find(
      (a) => a._id === submission.assignmentId
    );
    return assignment?.title || "Unknown Assignment";
  };

  const getAssignmentMaxScore = (submission: Submission) => {
    const assignment = submission.course.assignments?.find(
      (a) => a._id === submission.assignmentId
    );
    return assignment?.maxScore || 100;
  };

  const handleGrade = async () => {
    if (!selectedSubmission || !gradeInput) {
      toast.error("Please enter a grade");
      return;
    }

    const grade = parseInt(gradeInput);
    const maxScore = getAssignmentMaxScore(selectedSubmission);

    if (isNaN(grade) || grade < 0 || grade > maxScore) {
      toast.error(`Grade must be between 0 and ${maxScore}`);
      return;
    }

    setIsGrading(true);

    try {
      const res = await fetch(`/api/admin/assignments/${selectedSubmission._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          feedback: feedbackInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success("Assignment graded successfully");
      setSelectedSubmission(null);
      setGradeInput("");
      setFeedbackInput("");
      fetchSubmissions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to grade assignment");
    } finally {
      setIsGrading(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.student.name.toLowerCase().includes(query) ||
      s.student.email.toLowerCase().includes(query) ||
      s.course.title.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Assignment Review</h1>
        <p className="text-surface-600">Review and grade student submissions</p>
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2.5 border border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-100 rounded-lg">
                <FileText className="w-5 h-5 text-surface-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">{pagination.total}</p>
                <p className="text-sm text-surface-600">Total Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">
                  {submissions.filter((s) => s.status === "pending").length}
                </p>
                <p className="text-sm text-surface-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">
                  {submissions.filter((s) => s.status === "graded").length}
                </p>
                <p className="text-sm text-surface-600">Graded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-surface-400 mb-4" />
              <p className="text-surface-600">No submissions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission._id}
                  className="p-4 border border-surface-200 rounded-xl hover:border-surface-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-900">{submission.student?.name}</p>
                          <p className="text-sm text-surface-500">{submission.student?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-surface-600 mb-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{submission.course?.title}</span>
                        <span className="text-surface-400">•</span>
                        <span>{getAssignmentTitle(submission)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                          {submission.status === "graded" ? "Graded" : "Pending"}
                        </Badge>
                        {submission.status === "graded" && (
                          <span className="text-sm font-medium text-surface-900">
                            Score: {submission.grade}/{getAssignmentMaxScore(submission)}
                          </span>
                        )}
                        <span className="text-sm text-surface-500">
                          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.submissionType === "link" && (
                        <a
                          href={submission.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant={submission.status === "graded" ? "outline" : "default"}
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setGradeInput(submission.grade?.toString() || "");
                          setFeedbackInput(submission.feedback || "");
                        }}
                      >
                        {submission.status === "graded" ? "Edit Grade" : "Grade"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-surface-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} submissions
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-surface-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Grade Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-surface-600 mb-1">Student</p>
                <p className="font-medium">{selectedSubmission.student.name}</p>
              </div>
              <div>
                <p className="text-sm text-surface-600 mb-1">Assignment</p>
                <p className="font-medium">{getAssignmentTitle(selectedSubmission)}</p>
              </div>
              <div>
                <p className="text-sm text-surface-600 mb-1">Submission</p>
                {selectedSubmission.submissionType === "link" ? (
                  <a
                    href={selectedSubmission.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline flex items-center gap-1"
                  >
                    View Submission <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <div className="p-3 bg-surface-50 rounded-lg text-sm max-h-32 overflow-y-auto">
                    {selectedSubmission.content}
                  </div>
                )}
              </div>
              <Input
                label={`Grade (0-${getAssignmentMaxScore(selectedSubmission)})`}
                type="number"
                min={0}
                max={getAssignmentMaxScore(selectedSubmission)}
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Feedback (optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={3}
                  placeholder="Enter feedback for the student..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedSubmission(null);
                    setGradeInput("");
                    setFeedbackInput("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleGrade}
                  isLoading={isGrading}
                >
                  Save Grade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
