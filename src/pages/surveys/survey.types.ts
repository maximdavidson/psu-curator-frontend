export type QuestionType = "single" | "multiple" | "text";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
}

export interface ISurvey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}
