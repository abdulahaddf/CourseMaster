"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  SkeletonCard,
} from "@/components/ui";
import {
  Search,
  Filter,
  X,
  Star,
  Clock,
  BookOpen,
  Users,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/lib/constants";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses, setFilters, clearFilters, CoursesState } from "@/store/slices/courseSlice";
import type { AppDispatch } from "@/store";

interface Course {
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
}

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

function CoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { courses, isLoading, totalPages, currentPage, filters } = useSelector(
    (state: { courses: CoursesState }) => state.courses
  );
  
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: "student" | "admin"; avatar?: string } | null>(null);

  // Get initial values from URL
  useEffect(() => {
    const category = searchParams.get("category") || "";
    const level = searchParams.get("level") || "";
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "newest";
    const page = searchParams.get("page") || "1";

    dispatch(
      setFilters({
        category,
        level,
        search,
        sort,
      })
    );

    dispatch(
      fetchCourses({
        page: parseInt(page),
        category,
        level,
        search,
        sort,
      })
    );
  }, [searchParams, dispatch]);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // Not logged in
      }
    };
    fetchUser();
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);
      if (filters.level) params.set("level", filters.level);
      if (filters.sort) params.set("sort", filters.sort);
      params.set("page", "1");
      router.push(`/courses?${params.toString()}`);
    },
    [filters, router]
  );

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ [key]: value }));
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/courses?${params.toString()}`);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    router.push("/courses");
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/courses?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters =
    filters.search || filters.category || filters.level || filters.minPrice || filters.maxPrice;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-hero py-12 lg:py-16">
          <div className="container-custom">
            <div className="text-center text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Explore Our Courses
              </h1>
              <p className="text-primary-100 max-w-2xl mx-auto">
                Discover courses taught by industry experts and take your skills
                to the next level
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-8 max-w-3xl mx-auto">
              <div className="flex gap-3">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-600 group-focus-within:text-primary-700 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search courses by title, instructor, or topic..."
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-white border-2 border-white/80 shadow-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-300/50 text-surface-900 placeholder:text-surface-500 text-base transition-all duration-200"
                    value={filters.search}
                    onChange={(e) =>
                      dispatch(setFilters({ search: e.target.value }))
                    }
                  />
                </div>
                <Button type="submit" size="lg" className="shrink-0 h-14 px-8 text-base font-semibold shadow-xl hover:shadow-2xl transition-shadow">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container-custom">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters (Desktop) */}
              <aside className="hidden lg:block w-64 shrink-0">
                <Card className="sticky top-24 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-surface-900 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Category
                      </label>
                      <Select
                        options={[
                          { value: "", label: "All Categories" },
                          ...COURSE_CATEGORIES.map((cat) => ({
                            value: cat,
                            label: cat,
                          })),
                        ]}
                        value={filters.category}
                        onChange={(e) =>
                          handleFilterChange("category", e.target.value)
                        }
                      />
                    </div>

                    {/* Level Filter */}
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Level
                      </label>
                      <Select
                        options={[
                          { value: "", label: "All Levels" },
                          ...COURSE_LEVELS.map((level) => ({
                            value: level,
                            label: level,
                          })),
                        ]}
                        value={filters.level}
                        onChange={(e) =>
                          handleFilterChange("level", e.target.value)
                        }
                      />
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Price Range
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) =>
                            handleFilterChange("minPrice", e.target.value)
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) =>
                            handleFilterChange("maxPrice", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </aside>

              {/* Main Content Area */}
              <div className="flex-1">
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    {/* Mobile Filter Button */}
                    <Button
                      variant="outline"
                      className="lg:hidden"
                      onClick={() => setShowFilters(true)}
                      leftIcon={<SlidersHorizontal className="w-4 h-4" />}
                    >
                      Filters
                    </Button>

                    <p className="text-surface-600">
                      Showing{" "}
                      <span className="font-semibold text-surface-900">
                        {courses.length}
                      </span>{" "}
                      courses
                    </p>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-surface-600">Sort by:</span>
                    <Select
                      options={sortOptions}
                      value={filters.sort}
                      onChange={(e) => handleFilterChange("sort", e.target.value)}
                      className="w-48"
                    />
                  </div>
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {filters.search && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleFilterChange("search", "")}
                      >
                        Search: {filters.search}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    {filters.category && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleFilterChange("category", "")}
                      >
                        {filters.category}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    {filters.level && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleFilterChange("level", "")}
                      >
                        {filters.level}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                )}

                {/* Course Grid */}
                {isLoading ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : courses.length > 0 ? (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map((course: Course) => (
                      <Link
                        key={course._id}
                        href={`/courses/${course.slug}`}
                        className="group"
                      >
                        <Card hover className="h-full">
                          {/* Thumbnail */}
                          <div className="relative aspect-video bg-surface-100">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                <BookOpen className="w-12 h-12 text-primary-400" />
                              </div>
                            )}
                            <Badge className="absolute top-3 left-3">
                              {course.category}
                            </Badge>
                            {course.discountPrice && (
                              <Badge
                                variant="danger"
                                className="absolute top-3 right-3"
                              >
                                {Math.round(
                                  ((course.price - course.discountPrice) /
                                    course.price) *
                                    100
                                )}
                                % OFF
                              </Badge>
                            )}
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
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-surface-200">
                    <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-surface-900 mb-2">
                      No Courses Found
                    </h3>
                    <p className="text-surface-500 mb-4">
                      Try adjusting your filters or search terms
                    </p>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 5) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((page, index, arr) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && arr[index - 1] !== page - 1 && (
                            <span className="px-2 text-surface-400">...</span>
                          )}
                          <Button
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        </div>
                      ))}

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Filter Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 shadow-xl animate-fade-in overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-surface-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Category
                  </label>
                  <Select
                    options={[
                      { value: "", label: "All Categories" },
                      ...COURSE_CATEGORIES.map((cat) => ({
                        value: cat,
                        label: cat,
                      })),
                    ]}
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                  />
                </div>

                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Level
                  </label>
                  <Select
                    options={[
                      { value: "", label: "All Levels" },
                      ...COURSE_LEVELS.map((level) => ({
                        value: level,
                        label: level,
                      })),
                    ]}
                    value={filters.level}
                    onChange={(e) => handleFilterChange("level", e.target.value)}
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button className="w-full" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      handleClearFilters();
                      setShowFilters(false);
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CoursesContent />
    </Suspense>
  );
}
