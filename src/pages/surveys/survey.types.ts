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
  isAnonymous: boolean;
  deadlineAt?: string | null;
  timeLimitMinutes?: number | null;
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
  isAnonymous: boolean;
  deadlineAt?: string | null;
  timeLimitMinutes?: number | null;
  attemptStartedAt?: string | null;
  attemptExpiresAt?: string | null;
  isTimeExpired?: boolean;
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
export interface RespondentChoiceAnswer {
  respondentName: string;
  submittedAt: string;
  selectedOptions: string[];
}
export interface QuestionStatistics {
  questionId: string;
  text: string;
  type: QuestionType;
  answeredCount: number;
  optionStats?: OptionStatistics[];
  respondentChoiceAnswers?: RespondentChoiceAnswer[];
  textAnswers?: TextAnswerStatistics[];
}
export interface SurveyStatistics {
  surveyId: string;
  title: string;
  isAnonymous: boolean;
  totalResponses: number;
  questions: QuestionStatistics[];
}
