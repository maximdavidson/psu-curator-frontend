export type QuestionType = "single" | "multiple" | "text";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
}

export interface SurveyListItem {
  id: string;
  title: string;
  description: string;
  ownerName: string;
  createdByUserId?: string;
  questionCount: number;
  responseCount: number;
}

export interface SurveyDetail {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
  isPublished?: boolean;
  createdByUserId?: string;
  ownerName?: string;
  hasCurrentUserResponded: boolean;
  responseCount: number;
  questions: Question[];
}

export interface QuestionAnswerPayload {
  questionId: string;
  selectedOptions: string[];
  textValue?: string;
}

export interface SubmitSurveyPayload {
  answers: QuestionAnswerPayload[];
}

export interface OptionStatistics {
  option: string;
  count: number;
  percentage: number;
}

export interface TextAnswerStatistics {
  respondentName: string;
  text: string;
  submittedAt: string;
}

export interface QuestionStatistics {
  questionId: string;
  text: string;
  type: QuestionType;
  answeredCount: number;
  optionStats?: OptionStatistics[];
  textAnswers?: TextAnswerStatistics[];
}

export interface SurveyStatistics {
  surveyId: string;
  title: string;
  totalResponses: number;
  questions: QuestionStatistics[];
}
