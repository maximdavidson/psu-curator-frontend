export interface ISurvey {
  id: string;
  title: string;
  description: string;
  questions?: Question[];
}

export interface Question {
  id?: string;
  text: string;
  type: "single" | "multiple" | "text";
  options: string[];
}
