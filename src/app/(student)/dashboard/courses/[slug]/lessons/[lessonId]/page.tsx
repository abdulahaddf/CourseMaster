import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { getCurrentUser } from "@/lib/auth";
import LessonPlayer from "@/components/dashboard/LessonPlayer";
import { ArrowLeft, List } from "lucide-react";

async function getLessonData(slug: string, lessonId: string, userId: string) {
  await connectDB();

  const course = await Course.findOne({ slug, isPublished: true }).lean();

  if (!course) {
    return null;
  }

  const enrollment = await Enrollment.findOne({
    student: userId,
    course: course._id,
  }).lean();

  if (!enrollment) {
    return null;
  }

  // Find the lesson
  let currentLesson = null;
  let prevLesson = null;
  let nextLesson = null;
  let lessonFound = false;

  // Flatten all lessons with module info
  const allLessons: Array<{
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    order: number;
    isFree: boolean;
    type: "video" | "article" | "quiz";
    content: string;
  }> = [];

  for (const courseModule of course.modules) {
    for (const lesson of courseModule.lessons) {
      allLessons.push({
        _id: lesson._id.toString(),
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        order: lesson.order,
        isFree: lesson.isFree,
        type: lesson.videoUrl ? "video" : "article",
        content: lesson.description || "",
      });
    }
  }

  // Find current, prev, and next lessons
  for (let i = 0; i < allLessons.length; i++) {
    if (allLessons[i]._id.toString() === lessonId) {
      currentLesson = allLessons[i];
      prevLesson = i > 0 ? { _id: allLessons[i - 1]._id.toString(), title: allLessons[i - 1].title } : null;
      nextLesson =
        i < allLessons.length - 1
          ? { _id: allLessons[i + 1]._id.toString(), title: allLessons[i + 1].title }
          : null;
      lessonFound = true;
      break;
    }
  }

  if (!lessonFound || !currentLesson) {
    return null;
  }

  // Check if lesson is completed by looking through progress
  const isCompleted = enrollment.progress?.some(
    (moduleProgress: { lessons?: Array<{ lessonId: { toString: () => string }; completed: boolean }> }) =>
      moduleProgress.lessons?.some(
        (lessonProgress) =>
          lessonProgress.lessonId.toString() === lessonId && lessonProgress.completed
      )
  ) ?? false;

  return {
    course: JSON.parse(JSON.stringify(course)),
    enrollment: JSON.parse(JSON.stringify(enrollment)),
    lesson: JSON.parse(JSON.stringify(currentLesson)),
    prevLesson,
    nextLesson,
    isCompleted,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const user = await getCurrentUser();
  const { slug, lessonId } = await params;
  const data = await getLessonData(slug, lessonId, user!._id.toString());

  if (!data) {
    notFound();
  }

  const { course, enrollment, lesson, prevLesson, nextLesson, isCompleted } = data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/courses/${slug}`}
          className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{course.title}</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <Link
          href={`/dashboard/courses/${slug}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors"
        >
          <List className="w-4 h-4" />
          <span>All Lessons</span>
        </Link>
      </div>

      {/* Lesson Player */}
      <LessonPlayer
        lesson={lesson}
        courseSlug={slug}
        isCompleted={isCompleted}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        enrollmentId={enrollment._id}
      />
    </div>
  );
}
