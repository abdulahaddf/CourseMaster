import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { getCurrentUser } from "@/lib/auth";
import { courseSchema, courseQuerySchema } from "@/lib/validations";
import { cache, cacheKeys, cacheTTL } from "@/lib/cache";

// GET - Fetch courses with filtering, pagination, and sorting
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    
    // Parse and validate query params
    const queryResult = courseQuerySchema.safeParse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      level: searchParams.get("level") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      tag: searchParams.get("tag") || "",
      sort: searchParams.get("sort") || "newest",
    });
    
    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }
    
    const { page, limit, search, category, level, minPrice, maxPrice, tag, sort } =
      queryResult.data;
    
    const featured = searchParams.get("featured") === "true";
    
    // Build query
    const query: Record<string, unknown> = { isPublished: true };
    
    if (featured) {
      query.isFeatured = true;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.level = level;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) (query.price as Record<string, number>).$gte = parseFloat(minPrice);
      if (maxPrice) (query.price as Record<string, number>).$lte = parseFloat(maxPrice);
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    // Build sort
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    
    switch (sort) {
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "price_low":
        sortOption = { price: 1 };
        break;
      case "price_high":
        sortOption = { price: -1 };
        break;
      case "popular":
        sortOption = { enrolledCount: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Create cache key from query params
    const cacheKey = cacheKeys.courseList({
      page: page || "1",
      limit: limit || "10",
      search: search || "",
      category: category || "",
      level: level || "",
      minPrice: minPrice || "",
      maxPrice: maxPrice || "",
      tag: tag || "",
      sort: sort || "newest",
      featured: featured.toString(),
    });
    
    // Try to get from cache first (cache for 30 seconds)
    const cachedResult = cache.get<{
      courses: unknown[];
      total: number;
    }>(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        courses: cachedResult.courses,
        totalPages: Math.ceil(cachedResult.total / limitNum),
        currentPage: pageNum,
        total: cachedResult.total,
        cached: true,
      });
    }
    
    // Execute query
    const [courses, total] = await Promise.all([
      Course.find(query)
        .select(
          "title slug shortDescription thumbnail instructorName price discountPrice category level totalDuration totalLessons enrolledCount rating reviewCount isFeatured"
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Course.countDocuments(query),
    ]);
    
    // Cache the result
    cache.set(cacheKey, { courses, total }, cacheTTL.SHORT);
    
    return NextResponse.json({
      success: true,
      courses,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    });
  } catch (error) {
    console.error("Fetch courses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST - Create a new course (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can create courses." },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const body = await req.json();
    
    // Validate input
    const validationResult = courseSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => e.message);
      return NextResponse.json(
        { error: errors[0] },
        { status: 400 }
      );
    }
    
    const courseData = validationResult.data;
    
    // Transform batch dates from strings to Date objects
    const transformedBatches = courseData.batches?.map((batch) => ({
      ...batch,
      startDate: new Date(batch.startDate),
      endDate: new Date(batch.endDate),
    }));
    
    // Create course
    const course = await Course.create({
      ...courseData,
      batches: transformedBatches,
      instructor: user._id,
      instructorName: user.name,
    });
    
    // Invalidate course list cache
    cache.deletePattern("courses:list:");
    
    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully",
        course,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
