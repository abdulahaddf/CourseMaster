import mongoose, { Document, Model, Schema } from "mongoose";

// Assignment Submission
export interface IAssignmentSubmission extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  moduleId?: mongoose.Types.ObjectId;
  submissionType: "link" | "text";
  content: string; // Google Drive link or text answer
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: mongoose.Types.ObjectId;
  status: "pending" | "graded";
}

const assignmentSubmissionSchema = new Schema<IAssignmentSubmission>(
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
    assignmentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
    },
    submissionType: {
      type: String,
      enum: ["link", "text"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    grade: {
      type: Number,
      min: 0,
    },
    feedback: {
      type: String,
    },
    gradedAt: {
      type: Date,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "graded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
assignmentSubmissionSchema.index({ student: 1, course: 1 });
assignmentSubmissionSchema.index({ course: 1, assignmentId: 1 });
assignmentSubmissionSchema.index({ status: 1 });
assignmentSubmissionSchema.index({ submittedAt: -1 }); // For sorting by submission date
assignmentSubmissionSchema.index({ student: 1, assignmentId: 1 }, { unique: true }); // Prevent duplicate submissions

// Quiz Attempt
export interface IQuizAnswer {
  questionId: mongoose.Types.ObjectId;
  selectedOption: number;
  isCorrect: boolean;
  points: number;
}

export interface IQuizAttempt extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  moduleId?: mongoose.Types.ObjectId;
  answers: IQuizAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date;
  timeSpent: number; // in seconds
}

const quizAnswerSchema = new Schema<IQuizAnswer>({
  questionId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  selectedOption: {
    type: Number,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
});

const quizAttemptSchema = new Schema<IQuizAttempt>(
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
    quizId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
    },
    answers: [quizAnswerSchema],
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizAttemptSchema.index({ student: 1, course: 1 });
quizAttemptSchema.index({ student: 1, quizId: 1 });

export const AssignmentSubmission: Model<IAssignmentSubmission> =
  mongoose.models.AssignmentSubmission ||
  mongoose.model<IAssignmentSubmission>("AssignmentSubmission", assignmentSubmissionSchema);

export const QuizAttempt: Model<IQuizAttempt> =
  mongoose.models.QuizAttempt ||
  mongoose.model<IQuizAttempt>("QuizAttempt", quizAttemptSchema);
