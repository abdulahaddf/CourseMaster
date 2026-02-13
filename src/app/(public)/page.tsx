import Link from "next/link";
import { Button, Badge } from "@/components/ui";
import {
  ArrowRight,
  Play,
  Star,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { formatPrice } from "@/lib/utils";
import { COURSE_CATEGORIES } from "@/lib/constants";

// Stats data
const stats = [
  { value: "50K+", label: "Active Students", icon: Users },
  { value: "500+", label: "Expert Courses", icon: BookOpen },
  { value: "100+", label: "Instructors", icon: Award },
  { value: "4.9", label: "Average Rating", icon: Star },
];

// Features
const features = [
  {
    icon: Play,
    title: "Learn at Your Pace",
    description:
      "Access courses anytime, anywhere. Learn on your schedule with lifetime access to all purchased content.",
  },
  {
    icon: Award,
    title: "Expert Instructors",
    description:
      "Learn from industry professionals with real-world experience and proven track records.",
  },
  {
    icon: CheckCircle,
    title: "Practical Projects",
    description:
      "Build real projects and portfolio pieces as you learn. Apply your knowledge immediately.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description:
      "Monitor your learning journey with detailed progress tracking and achievements.",
  },
];

async function getFeaturedCourses() {
  try {
    await connectDB();
    const courses = await Course.find({ isPublished: true, isFeatured: true })
      .select(
        "title slug shortDescription thumbnail instructorName price discountPrice category level totalDuration totalLessons enrolledCount rating reviewCount"
      )
      .limit(6)
      .lean();
    return JSON.parse(JSON.stringify(courses));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const featuredCourses = await getFeaturedCourses();

  const userData = user
    ? {
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={userData} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="container-custom relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <Badge
                  variant="secondary"
                  className="mb-6 bg-white/20 text-white border-white/30"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  #1 Learning Platform
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 text-shadow-lg">
                  Master Your Skills,{" "}
                  <span className="text-primary-200">Shape Your Future</span>
                </h1>

                <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto lg:mx-0">
                  Join thousands of learners worldwide. Access 500+ expert-led
                  courses and transform your career with in-demand skills.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/courses">
                    <Button
                      size="xl"
                      className="bg-white text-primary-700 hover:bg-primary-50 shadow-xl"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Explore Courses
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      size="xl"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                      leftIcon={<Play className="w-5 h-5" />}
                    >
                      Watch Demo
                    </Button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white text-sm font-medium"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1 text-yellow-300">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-primary-100 text-sm">
                      4.9/5 from 10,000+ reviews
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Content - Hero Image */}
              <div className="relative hidden lg:block">
                <div className="relative">
                  {/* Main Card */}
                  <div className="bg-white rounded-3xl shadow-2xl p-6 transform rotate-2">
                    <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-primary-600 ml-1" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-semibold text-surface-900">
                        Complete Web Development
                      </h3>
                      <p className="text-sm text-surface-500">
                        Start your coding journey
                      </p>
                    </div>
                  </div>

                  {/* Floating Cards */}
                  <div className="absolute -top-4 -left-8 bg-white rounded-2xl shadow-xl p-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-accent-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-surface-900">
                          1,234 Enrolled
                        </p>
                        <p className="text-xs text-surface-500">This week</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-surface-900">
                          Certificate
                        </p>
                        <p className="text-xs text-surface-500">On completion</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white border-b border-surface-100">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-3">
                    <stat.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-3xl font-bold text-surface-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-surface-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-surface-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <Badge variant="default" className="mb-4">
                Popular Categories
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
                Explore Top Categories
              </h2>
              <p className="text-surface-600 max-w-2xl mx-auto">
                Browse through our most popular course categories and find the
                perfect learning path for your career goals.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {COURSE_CATEGORIES.map((category, index) => (
                <Link
                  key={category}
                  href={`/courses?category=${encodeURIComponent(category)}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-6 text-center border border-surface-200 card-hover">
                    <div
                      className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: `hsl(${(index * 36) % 360}, 90%, 85%)`,
                      }}
                    >
                      <BookOpen
                        className="w-6 h-6"
                        style={{
                          color: `hsl(${(index * 36) % 360}, 70%, 45%)`,
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">
                      {category}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div>
                <Badge variant="success" className="mb-4">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending Now
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-2">
                  Featured Courses
                </h2>
                <p className="text-surface-600">
                  Handpicked courses to accelerate your learning journey
                </p>
              </div>
              <Link href="/courses">
                <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All Courses
                </Button>
              </Link>
            </div>

            {featuredCourses.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCourses.map((course: {
                  _id: string;
                  title: string;
                  slug: string;
                  shortDescription: string;
                  thumbnail: string;
                  instructorName: string;
                  price: number;
                  discountPrice?: number;
                  category: string;
                  level: string;
                  totalDuration: number;
                  totalLessons: number;
                  enrolledCount: number;
                  rating: number;
                  reviewCount: number;
                }) => (
                  <Link
                    key={course._id}
                    href={`/courses/${course.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden card-hover">
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-surface-100">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-primary-400" />
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3">
                          {course.category}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-sm text-surface-500 mb-2">
                          <span>{course.instructorName}</span>
                          <span>•</span>
                          <span>{course.level}</span>
                        </div>

                        <h3 className="font-semibold text-surface-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {course.title}
                        </h3>

                        <p className="text-sm text-surface-500 line-clamp-2 mb-4">
                          {course.shortDescription}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-surface-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.totalDuration}h
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {course.totalLessons} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.enrolledCount}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium text-surface-900">
                              {course.rating.toFixed(1)}
                            </span>
                            <span className="text-surface-400 text-sm">
                              ({course.reviewCount})
                            </span>
                          </div>
                          <div className="text-right">
                            {course.discountPrice ? (
                              <>
                                <span className="text-lg font-bold text-surface-900">
                                  {formatPrice(course.discountPrice)}
                                </span>
                                <span className="text-sm text-surface-400 line-through ml-2">
                                  {formatPrice(course.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-surface-900">
                                {course.price === 0
                                  ? "Free"
                                  : formatPrice(course.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-surface-200">
                <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  No Courses Yet
                </h3>
                <p className="text-surface-500">
                  Check back soon for featured courses!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-surface-900 text-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-white/10 border-white/20 text-white">
                Why Choose Us
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-surface-400 max-w-2xl mx-auto">
                We provide all the tools and resources you need to master new
                skills and advance your career.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-surface-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container-custom">
            <div className="bg-gradient-primary rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Start Learning?
                </h2>
                <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
                  Join over 50,000 students worldwide and start your learning
                  journey today. Access premium courses and expert guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button
                      size="xl"
                      className="bg-white text-primary-700 hover:bg-primary-50"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/courses">
                    <Button
                      size="xl"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Browse Courses
                    </Button>
                  </Link>
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
