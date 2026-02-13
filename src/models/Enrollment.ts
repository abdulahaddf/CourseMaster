import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILessonProgress {
  lessonId: mongoose.Types.ObjectId;
  completed: boolean;
  watchedDuration: number;
  completedAt?: Date;
}

export interface IModuleProgress {
  moduleId: mongoose.Types.ObjectId;
  lessons: ILessonProgress[];
  completed: boolean;
}

export interface IQuizAttempt {
  quizId: mongoose.Types.ObjectId;
  answers: number[];
  score: number;
  passed: boolean;
  attemptedAt: Date;
}

export interface IAssignmentSubmission {
  assignmentId: mongoose.Types.ObjectId;
  submissionUrl: string;
  submissionText?: string;
  score?: number;
  feedback?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  status: "pending" | "reviewed" | "needs_revision";
}

export interface IEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  batch?: mongoose.Types.ObjectId;
  enrolledAt: Date;
  progress: IModuleProgress[];
  quizAttempts: IQuizAttempt[];
  assignmentSubmissions: IAssignmentSubmission[];
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
  completedAt?: Date;
  certificateIssued: boolean;
}

const lessonProgressSchema = new Schema<ILessonProgress>({
  lessonId: { type: Schema.Types.ObjectId, required: true },
  completed: { type: Boolean, default: false },
  watchedDuration: { type: Number, default: 0 },
  completedAt: { type: Date },
});

const moduleProgressSchema = new Schema<IModuleProgress>({
  moduleId: { type: Schema.Types.ObjectId, required: true },
  lessons: [lessonProgressSchema],
  completed: { type: Boolean, default: false },
});

const quizAttemptSchema = new Schema<IQuizAttempt>({
  quizId: { type: Schema.Types.ObjectId, required: true },
  answers: [{ type: Number }],
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  attemptedAt: { type: Date, default: Date.now },
});

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>({
  assignmentId: { type: Schema.Types.ObjectId, required: true },
  submissionUrl: { type: String, required: true },
  submissionText: { type: String },
  score: { type: Number },
  feedback: { type: String },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  status: {
    type: String,
    enum: ["pending", "reviewed", "needs_revision"],
    default: "pending",
  },
});

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    batch: {
      type: Schema.Types.ObjectId,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    progress: [moduleProgressSchema],
    quizAttempts: [quizAttemptSchema],
    assignmentSubmissions: [assignmentSubmissionSchema],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLessons: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique enrollment
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ batch: 1 });
enrollmentSchema.index({ isCompleted: 1 }); // For filtering by completion status
enrollmentSchema.index({ enrolledAt: -1 }); // For sorting by enrollment date
enrollmentSchema.index({ overallProgress: 1 }); // For progress filtering

// Update progress calculation
enrollmentSchema.methods.calculateProgress = function () {
  let completedLessons = 0;
  
  this.progress.forEach((module: IModuleProgress) => {
    module.lessons.forEach((lesson: ILessonProgress) => {
      if (lesson.completed) completedLessons++;
    });
  });
  
  this.completedLessons = completedLessons;
  this.overallProgress =
    this.totalLessons > 0
      ? Math.round((completedLessons / this.totalLessons) * 100)
      : 0;
  this.isCompleted = this.overallProgress === 100;
  
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
  }
};

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
