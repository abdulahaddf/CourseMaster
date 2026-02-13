export { default as User } from "./User";
export type { IUser } from "./User";

export { default as Course } from "./Course";
export type {
  ICourse,
  IModule,
  ILesson,
  IBatch,
  IQuiz,
  IQuizQuestion,
  IAssignment,
} from "./Course";

export { default as Enrollment } from "./Enrollment";
export type {
  IEnrollment,
  IModuleProgress,
  ILessonProgress,
} from "./Enrollment";

export {
  AssignmentSubmission,
  QuizAttempt,
} from "./Submission";
export type {
  IAssignmentSubmission,
  IQuizAttempt as IQuizAttemptSubmission,
  IQuizAnswer,
} from "./Submission";
