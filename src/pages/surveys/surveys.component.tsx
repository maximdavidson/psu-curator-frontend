import { useState } from "react";
import styles from "./surveys.module.scss";
import { SurveyCard } from "./components/survey-card/survey-card";
import {
  CreateSurveyModal,
  type SurveyData
} from "./components/create-survey-modal/create-survey-modal";

export interface ISurvey {
  id: string;
  title: string;
  description: string;
}

export const SurveysPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [surveys, setSurveys] = useState<ISurvey[]>([]);

  const handleCreateSurvey = (data: SurveyData) => {
    const newSurvey: ISurvey = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description
    };

    setSurveys((prev) => [newSurvey, ...prev]);
    setIsOpen(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Опросы</h1>
        <button onClick={() => setIsOpen(true)}>Создать опрос</button>
      </div>

      <div className={styles.list}>
        {surveys.map((survey) => (
          <SurveyCard key={survey.id} survey={survey} />
        ))}
      </div>

      {isOpen && (
        <CreateSurveyModal
          onClose={() => setIsOpen(false)}
          onCreate={handleCreateSurvey}
        />
      )}
    </div>
  );
};
