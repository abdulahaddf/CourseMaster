import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  instructorName: string;
  price: number;
  discountPrice?: number;
  category: string;
  tags: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  totalDuration: number;
  totalLessons: number;
  enrolledCount: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
}

export interface CoursesState {
  courses: Course[];
  featuredCourses: Course[];
  currentCourse: Course | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  filters: {
    search: string;
    category: string;
    level: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
  };
}

const initialState: CoursesState = {
  courses: [],
  featuredCourses: [],
  currentCourse: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  filters: {
    search: "",
    category: "",
    level: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  },
};

// Fetch courses with filters
export const fetchCourses = createAsyncThunk(
  "courses/fetchCourses",
  async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    level?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.search) queryParams.set("search", params.search);
    if (params.category) queryParams.set("category", params.category);
    if (params.level) queryParams.set("level", params.level);
    if (params.minPrice) queryParams.set("minPrice", params.minPrice);
    if (params.maxPrice) queryParams.set("maxPrice", params.maxPrice);
    if (params.sort) queryParams.set("sort", params.sort);
    
    const response = await fetch(`/api/courses?${queryParams.toString()}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch courses");
    }
    
    return data;
  }
);

// Fetch featured courses
export const fetchFeaturedCourses = createAsyncThunk(
  "courses/fetchFeatured",
  async () => {
    const response = await fetch("/api/courses?featured=true&limit=6");
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch featured courses");
    }
    
    return data.courses;
  }
);

// Fetch single course
export const fetchCourse = createAsyncThunk(
  "courses/fetchCourse",
  async (slug: string) => {
    const response = await fetch(`/api/courses/${slug}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Course not found");
    }
    
    return data.course;
  }
);

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<CoursesState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.courses = action.payload.courses;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.isLoading = false;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch courses";
      })
      // Fetch Featured
      .addCase(fetchFeaturedCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFeaturedCourses.fulfilled, (state, action) => {
        state.featuredCourses = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchFeaturedCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch featured courses";
      })
      // Fetch Single Course
      .addCase(fetchCourse.pending, (state) => {
        state.isLoading = true;
        state.currentCourse = null;
      })
      .addCase(fetchCourse.fulfilled, (state, action) => {
        state.currentCourse = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Course not found";
      });
  },
});

export const { setFilters, clearFilters, setCurrentPage } = courseSlice.actions;
export default courseSlice.reducer;
