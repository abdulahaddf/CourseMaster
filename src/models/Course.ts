import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILesson {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in minutes
  order: number;
  isFree: boolean;
}

export interface IModule {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  order: number;
  lessons: ILesson[];
}

export interface IBatch {
  _id: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  maxStudents: number;
  enrolledCount: number;
  isActive: boolean;
}

export interface IQuizQuestion {
  _id: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface IQuiz {
  _id: mongoose.Types.ObjectId;
  title: string;
  moduleId?: mongoose.Types.ObjectId;
  questions: IQuizQuestion[];
  passingScore: number;
  timeLimit: number; // in minutes
}

export interface IAssignment {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  moduleId?: mongoose.Types.ObjectId;
  dueDate?: Date;
  maxScore: number;
}

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  instructor: mongoose.Types.ObjectId;
  instructorName: string;
  price: number;
  discountPrice?: number;
  category: string;
  tags: string[];
  level: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  modules: IModule[];
  batches: IBatch[];
  quizzes: IQuiz[];
  assignments: IAssignment[];
  totalDuration: number;
  totalLessons: number;
  enrolledCount: number;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  duration: { type: Number, default: 0 },
  order: { type: Number, required: true },
  isFree: { type: Boolean, default: false },
});

const moduleSchema = new Schema<IModule>({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  order: { type: Number, required: true },
  lessons: [lessonSchema],
});

const batchSchema = new Schema<IBatch>({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  maxStudents: { type: Number, default: 50 },
  enrolledCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const quizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  points: { type: Number, default: 1 },
});

const quizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  moduleId: { type: Schema.Types.ObjectId },
  questions: [quizQuestionSchema],
  passingScore: { type: Number, default: 60 },
  timeLimit: { type: Number, default: 30 },
});

const assignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  moduleId: { type: Schema.Types.ObjectId },
  dueDate: { type: Date },
  maxScore: { type: Number, default: 100 },
});

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
    },
    shortDescription: {
      type: String,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    thumbnail: {
      type: String,
      default: "/images/course-placeholder.jpg",
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    tags: [{ type: String }],
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    language: {
      type: String,
      default: "English",
    },
    modules: [moduleSchema],
    batches: [batchSchema],
    quizzes: [quizSchema],
    assignments: [assignmentSchema],
    totalDuration: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering (slug already indexed via unique: true)
courseSchema.index({ title: "text", description: "text", tags: "text", instructorName: "text" });
courseSchema.index({ category: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ createdAt: -1 }); // For sorting by newest
courseSchema.index({ enrolledCount: -1 }); // For popular courses
courseSchema.index({ rating: -1 }); // For top rated courses
courseSchema.index({ category: 1, isPublished: 1 }); // Compound index for category + published filter
courseSchema.index({ level: 1, isPublished: 1 }); // Compound index for level + published filter

// Generate slug before saving
courseSchema.pre("save", function () {
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }
  
  // Calculate totals
  let totalLessons = 0;
  let totalDuration = 0;
  
  this.modules.forEach((module) => {
    totalLessons += module.lessons.length;
    module.lessons.forEach((lesson) => {
      totalDuration += lesson.duration;
    });
  });
  
  this.totalLessons = totalLessons;
  this.totalDuration = totalDuration;
});

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", courseSchema);

export default Course;
