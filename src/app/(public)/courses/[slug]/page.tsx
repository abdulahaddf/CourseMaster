import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {  Badge, Avatar } from "@/components/ui";
import {
  Star,
  Clock,
  BookOpen,
  Users,
  Play,
  CheckCircle,
  Globe,
  Award,
  FileText,
  HelpCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { connectDB } from "@/lib/db";
import Course, { IModule, ILesson } from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { getCurrentUser } from "@/lib/auth";
import { EnrollButton } from "./EnrollButton";
import { ModuleAccordion } from "./ModuleAccordion";
// import { EnrollButton } from "./EnrollButton";
// import { ModuleAccordion } from "./ModuleAccordion";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCourse(slug: string) {
  await connectDB();
  const course = await Course.findOne({ slug, isPublished: true })
    .populate("instructor", "name email avatar bio")
    .lean();

  if (!course) return null;
  return JSON.parse(JSON.stringify(course));
}

async function getEnrollmentStatus(courseId: string, userId?: string) {
  if (!userId) return null;

  await connectDB();
  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: userId,
  }).lean();

  return enrollment ? JSON.parse(JSON.stringify(enrollment)) : null;
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const user = await getCurrentUser();
  const enrollment = user
    ? await getEnrollmentStatus(course._id, user._id.toString())
    : null;

  const isEnrolled = !!enrollment;

  const userData = user
    ? {
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      }
    : null;

  // Calculate total videos and duration
  const totalVideos = course.modules?.reduce(
    (acc: number, mod: IModule) => acc + (mod.lessons?.length || 0),
    0
  ) || 0;
  const totalDuration = course.modules?.reduce(
    (acc: number, mod: IModule) =>
      acc +
      (mod.lessons?.reduce((a: number, l: ILesson) => a + (l.duration || 0), 0) || 0),
    0
  ) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar user={userData} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-surface-900 text-white py-12 lg:py-16">
          <div className="container-custom">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Course Info */}
              <div className="lg:col-span-2">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-surface-400 mb-6">
                  <Link href="/courses" className="hover:text-white">
                    Courses
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/courses?category=${course.category}`}
                    className="hover:text-white"
                  >
                    {course.category}
                  </Link>
                </nav>

                <Badge className="mb-4 bg-primary-500/20 text-primary-300 border-primary-500/30">
                  {course.level}
                </Badge>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {course.title}
                </h1>

                <p className="text-lg text-surface-300 mb-6">
                  {course.shortDescription || course.description?.slice(0, 200)}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{course.rating?.toFixed(1) || "0.0"}</span>
                    <span className="text-surface-400">
                      ({course.reviewCount || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-surface-300">
                    <Users className="w-4 h-4" />
                    {course.enrolledCount || 0} students enrolled
                  </div>
                  <div className="flex items-center gap-2 text-surface-300">
                    <Globe className="w-4 h-4" />
                    {course.language || "English"}
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-surface-700">
                  <Avatar
                    src={course.instructor?.avatar}
                    alt={course.instructorName}
                    fallback={course.instructorName}
                  />
                  <div>
                    <p className="text-sm text-surface-400">Instructor</p>
                    <p className="font-medium">{course.instructorName}</p>
                  </div>
                </div>
              </div>

              {/* Sticky Card (Desktop) */}
              <div className="hidden lg:block">
                <div className="sticky top-24 bg-white rounded-2xl shadow-xl overflow-hidden">
                  {/* Preview Image */}
                  <div className="relative aspect-video bg-surface-100">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <Play className="w-16 h-16 text-white/80" />
                      </div>
                    )}
                    <button className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-600 ml-1" />
                      </div>
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Price */}
                    <div className="mb-4">
                      {course.discountPrice ? (
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-bold text-surface-900">
                            {formatPrice(course.discountPrice)}
                          </span>
                          <span className="text-lg text-surface-400 line-through">
                            {formatPrice(course.price)}
                          </span>
                          <Badge variant="danger">
                            {Math.round(
                              ((course.price - course.discountPrice) /
                                course.price) *
                                100
                            )}
                            % OFF
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold text-surface-900">
                          {course.price === 0 ? "Free" : formatPrice(course.price)}
                        </span>
                      )}
                    </div>

                    {/* CTA Button */}
                    <EnrollButton
                      courseId={course._id}
                      isEnrolled={isEnrolled}
                      isLoggedIn={!!user}
                      courseSlug={course.slug}
                    />

                    {/* Course includes */}
                    <div className="mt-6 space-y-3 text-sm">
                      <p className="font-medium text-surface-900">
                        This course includes:
                      </p>
                      <div className="flex items-center gap-3 text-surface-600">
                        <Play className="w-4 h-4 text-primary-600" />
                        <span>
                          {totalDuration > 60
                            ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
                            : `${totalDuration}m`}{" "}
                          on-demand video
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-surface-600">
                        <BookOpen className="w-4 h-4 text-primary-600" />
                        <span>{totalVideos} lessons</span>
                      </div>
                      <div className="flex items-center gap-3 text-surface-600">
                        <FileText className="w-4 h-4 text-primary-600" />
                        <span>
                          {course.assignments?.length || 0} assignments
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-surface-600">
                        <HelpCircle className="w-4 h-4 text-primary-600" />
                        <span>{course.quizzes?.length || 0} quizzes</span>
                      </div>
                      <div className="flex items-center gap-3 text-surface-600">
                        <Clock className="w-4 h-4 text-primary-600" />
                        <span>Full lifetime access</span>
                      </div>
                      <div className="flex items-center gap-3 text-surface-600">
                        <Award className="w-4 h-4 text-primary-600" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Price Card */}
        <div className="lg:hidden sticky top-0 z-40 bg-white shadow-md p-4 flex items-center justify-between">
          <div>
            {course.discountPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-surface-900">
                  {formatPrice(course.discountPrice)}
                </span>
                <span className="text-sm text-surface-400 line-through">
                  {formatPrice(course.price)}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-surface-900">
                {course.price === 0 ? "Free" : formatPrice(course.price)}
              </span>
            )}
          </div>
          <EnrollButton
            courseId={course._id}
            isEnrolled={isEnrolled}
            isLoggedIn={!!user}
            courseSlug={course.slug}
            size="sm"
          />
        </div>

        {/* Course Content */}
        <section className="py-12">
          <div className="container-custom">
            <div className="lg:max-w-3xl">
              {/* What you'll learn */}
              <div className="bg-white rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-bold text-surface-900 mb-4">
                  What you&apos;ll learn
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Build real-world projects from scratch",
                    "Master core concepts and best practices",
                    "Learn industry-standard tools and workflows",
                    "Get hands-on experience with assignments",
                    "Earn a certificate upon completion",
                    "Join a community of learners",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
                      <span className="text-surface-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Content */}
              <div className="bg-white rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-surface-900">
                    Course Content
                  </h2>
                  <p className="text-sm text-surface-500">
                    {course.modules?.length || 0} modules • {totalVideos} lessons •{" "}
                    {totalDuration > 60
                      ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
                      : `${totalDuration}m`}{" "}
                    total
                  </p>
                </div>

                {course.modules && course.modules.length > 0 ? (
                  <ModuleAccordion
                    modules={course.modules}
                    isEnrolled={isEnrolled}
                  />
                ) : (
                  <p className="text-surface-500 text-center py-8">
                    Course content coming soon...
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-bold text-surface-900 mb-4">
                  Description
                </h2>
                <div className="prose prose-surface max-w-none">
                  <p className="text-surface-700 whitespace-pre-line">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Instructor */}
              <div className="bg-white rounded-2xl p-6">
                <h2 className="text-xl font-bold text-surface-900 mb-4">
                  Instructor
                </h2>
                <div className="flex items-start gap-4">
                  <Avatar
                    src={course.instructor?.avatar}
                    alt={course.instructorName}
                    fallback={course.instructorName}
                    size="xl"
                  />
                  <div>
                    <h3 className="font-semibold text-surface-900">
                      {course.instructorName}
                    </h3>
                    <p className="text-sm text-surface-500 mb-2">Course Instructor</p>
                    <p className="text-surface-600">
                      {course.instructor?.bio ||
                        "Experienced instructor with a passion for teaching and helping students achieve their goals."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
