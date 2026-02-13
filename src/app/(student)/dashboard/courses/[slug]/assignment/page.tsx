"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
} from "@/components/ui";
import { ArrowLeft, FileText, Link as LinkIcon, Send, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  moduleId: string;
  dueDate?: string;
  maxScore: number;
}

interface Course {
  _id: string;
  title: string;
  assignments: Assignment[];
  modules: Array<{
    _id: string;
    title: string;
  }>;
}

interface Submission {
  _id: string;
  assignmentId: string;
  submissionType: "link" | "text";
  content: string;
  status: "pending" | "graded";
  grade?: number;
  feedback?: string;
  submittedAt: string;
}

export default function AssignmentSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get("assignmentId");
  const moduleId = searchParams.get("moduleId");

  const [course, setCourse] = useState<Course | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionType, setSubmissionType] = useState<"link" | "text">("link");
  const [content, setContent] = useState("");

  const fetchData = useCallback(async () => {
    try {
      // Fetch course data
      const courseRes = await fetch(`/api/courses/${params.slug}`);
      const courseData = await courseRes.json();
      
      if (!courseRes.ok) {
        throw new Error(courseData.error);
      }
      
      setCourse(courseData.course);

      // Find the assignment
      if (assignmentId && courseData.course.assignments) {
        const foundAssignment = courseData.course.assignments.find(
          (a: Assignment) => a._id === assignmentId
        );
        setAssignment(foundAssignment || null);
      }

      // Fetch existing submission
      const submissionRes = await fetch(`/api/assignments?courseId=${courseData.course._id}`);
      const submissionData = await submissionRes.json();
      
      if (submissionRes.ok && submissionData.submissions) {
        const existing = submissionData.submissions.find(
          (s: Submission) => s.assignmentId === assignmentId
        );
        if (existing) {
          setExistingSubmission(existing);
          setSubmissionType(existing.submissionType);
          setContent(existing.content);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load assignment");
    } finally {
      setIsLoading(false);
    }
  }, [params.slug, assignmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Please enter your submission");
      return;
    }

    if (submissionType === "link" && !content.startsWith("http")) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course?._id,
          assignmentId,
          moduleId,
          submissionType,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success(data.message);
      router.push(`/dashboard/courses/${params.slug}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModuleTitle = (modId: string) => {
    return course?.modules.find((m) => m._id === modId)?.title || "Unknown Module";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-surface-400 mb-4" />
            <h2 className="text-xl font-semibold text-surface-900 mb-2">Assignment Not Found</h2>
            <p className="text-surface-600 mb-6">
              The assignment you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href={`/dashboard/courses/${params.slug}`}>
              <Button>Back to Course</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link
        href={`/dashboard/courses/${params.slug}`}
        className="inline-flex items-center gap-2 text-surface-600 hover:text-surface-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Course
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <CardTitle>{assignment.title}</CardTitle>
              <CardDescription>
                Module: {getModuleTitle(assignment.moduleId || moduleId || "")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Assignment Description */}
          <div>
            <h3 className="font-medium text-surface-900 mb-2">Instructions</h3>
            <p className="text-surface-600">{assignment.description}</p>
          </div>

          {/* Assignment Info */}
          <div className="flex gap-4 text-sm">
            <div className="px-3 py-1.5 bg-surface-100 rounded-lg">
              <span className="text-surface-600">Max Score: </span>
              <span className="font-medium text-surface-900">{assignment.maxScore} pts</span>
            </div>
            {assignment.dueDate && (
              <div className="px-3 py-1.5 bg-surface-100 rounded-lg">
                <span className="text-surface-600">Due: </span>
                <span className="font-medium text-surface-900">
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Existing Submission Status */}
          {existingSubmission && existingSubmission.status === "graded" && (
            <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-accent-600" />
                <span className="font-medium text-accent-900">Graded</span>
              </div>
              <div className="text-sm text-accent-800">
                <p>Score: {existingSubmission.grade}/{assignment.maxScore}</p>
                {existingSubmission.feedback && (
                  <p className="mt-2">Feedback: {existingSubmission.feedback}</p>
                )}
              </div>
            </div>
          )}

          {existingSubmission && existingSubmission.status === "pending" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                You have a pending submission. You can resubmit below.
              </p>
            </div>
          )}

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Submission Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="submissionType"
                    value="link"
                    checked={submissionType === "link"}
                    onChange={() => setSubmissionType("link")}
                    className="w-4 h-4 text-primary-600"
                  />
                  <LinkIcon className="w-4 h-4 text-surface-500" />
                  <span>Google Drive Link</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="submissionType"
                    value="text"
                    checked={submissionType === "text"}
                    onChange={() => setSubmissionType("text")}
                    className="w-4 h-4 text-primary-600"
                  />
                  <FileText className="w-4 h-4 text-surface-500" />
                  <span>Text Answer</span>
                </label>
              </div>
            </div>

            {submissionType === "link" ? (
              <Input
                label="Google Drive Link"
                type="url"
                placeholder="https://drive.google.com/..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                leftIcon={<LinkIcon className="w-4 h-4" />}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-surface-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  rows={6}
                  placeholder="Enter your answer here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<Send className="w-4 h-4" />}
            >
              {existingSubmission ? "Resubmit Assignment" : "Submit Assignment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
