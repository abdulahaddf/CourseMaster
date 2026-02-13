"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Card, Badge } from "@/components/ui";
import {
  FileText,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Submission {
  _id: string;
  course: {
    _id: string;
    title: string;
    slug: string;
  };
  assignment: {
    _id: string;
    title: string;
  };
  submissionType: "link" | "text";
  status: "pending" | "reviewed" | "graded";
  score?: number;
  feedback?: string;
  createdAt: string;
}

export default function AssignmentsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/assignments");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch submissions");
      }

      setSubmissions(data.submissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Submission["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case "reviewed":
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Reviewed
          </Badge>
        );
      case "graded":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Graded
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Assignments</h1>
          <p className="text-surface-600">Track your assignment submissions</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Assignments</h1>
          <p className="text-surface-600">Track your assignment submissions</p>
        </div>
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3 text-red-800">
            <XCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">My Assignments</h1>
        <p className="text-surface-600">Track your assignment submissions</p>
      </div>

      {submissions.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-surface-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 mb-2">
            No Assignments Submitted
          </h3>
          <p className="text-surface-600 mb-6">
            You haven&apos;t submitted any assignments yet. Go to your courses to start working on assignments.
          </p>
          <Link href="/dashboard/courses">
            <Button>
              View My Courses
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission._id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-surface-500 mb-1">
                    <Link
                      href={`/dashboard/courses/${submission.course.slug}`}
                      className="hover:text-primary-600"
                    >
                      {submission.course.title}
                    </Link>
                  </div>
                  <h3 className="font-semibold text-surface-900 mb-2">
                    {submission.assignment.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-surface-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Submitted {formatDate(submission.createdAt)}
                    </span>
                    <span className="capitalize">
                      Type: {submission.submissionType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(submission.status)}

                  {submission.status === "graded" && submission.score !== undefined && (
                    <div className="text-right">
                      <p className="text-sm text-surface-500">Score</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {submission.score}%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {submission.feedback && (
                <div className="mt-4 pt-4 border-t border-surface-200">
                  <p className="text-sm font-medium text-surface-700 mb-1">
                    Instructor Feedback:
                  </p>
                  <p className="text-surface-600">{submission.feedback}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
