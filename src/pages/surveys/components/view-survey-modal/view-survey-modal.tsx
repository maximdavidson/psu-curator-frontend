import { useState } from "react";
import styles from "./view-survey-modal.module.scss";
import { useGetSurveyByIdQuery } from "../../survey.api";

interface ViewSurveyModalProps {
  isOpen: boolean;
  surveyId: string;
  onClose: () => void;
}

interface Question {
  text: string;
  type: string;
  options: string[];
}

export const ViewSurveyModal = ({
  isOpen,
  surveyId,
  onClose
}: ViewSurveyModalProps) => {
  const { data: survey, isLoading } = useGetSurveyByIdQuery(surveyId, {
    skip: !isOpen || !surveyId
  });

  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});

  if (!isOpen) return null;

  const handleSingleAnswer = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleMultipleAnswer = (
    questionIndex: number,
    option: string,
    checked: boolean
  ) => {
    const current = (answers[questionIndex] as string[]) || [];
    if (checked) {
      setAnswers((prev) => ({
        ...prev,
        [questionIndex]: [...current, option]
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [questionIndex]: current.filter((o) => o !== option)
      }));
    }
  };

  const handleTextAnswer = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const renderQuestion = (question: Question, idx: number) => {
    switch (question.type) {
      case "single":
        return (
          <div className={styles.optionsGroup}>
            {question.options.map((opt, optIdx) => (
              <label key={optIdx} className={styles.radioLabel}>
                <input
                  type="radio"
                  name={`question_${idx}`}
                  value={opt}
                  checked={answers[idx] === opt}
                  onChange={(e) => handleSingleAnswer(idx, e.target.value)}
                />
                {opt}
              </label>
            ))}
          </div>
        );

      case "multiple":
        return (
          <div className={styles.optionsGroup}>
            {question.options.map((opt, optIdx) => {
              const selected = (answers[idx] as string[]) || [];
              return (
                <label key={optIdx} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={(e) =>
                      handleMultipleAnswer(idx, opt, e.target.checked)
                    }
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        );

      case "text":
        return (
          <textarea
            className={styles.textarea}
            placeholder="Введите ваш ответ..."
            value={(answers[idx] as string) || ""}
            onChange={(e) => handleTextAnswer(idx, e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  const handleClose = () => {
    setAnswers({});
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          <div className={styles.header}>
            <h2>{survey?.title || "Загрузка..."}</h2>
            <button className={styles.closeBtn} onClick={handleClose}>
              ×
            </button>
          </div>

          <p className={styles.description}>{survey?.description}</p>

          {isLoading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            <>
              <div className={styles.questions}>
                {survey?.questions.map((question, idx) => (
                  <div key={idx} className={styles.question}>
                    <div className={styles.questionText}>
                      {idx + 1}. {question.text}
                    </div>
                    {renderQuestion(question, idx)}
                  </div>
                ))}
              </div>

              <div className={styles.footer}>
                <button
                  className={styles.submitBtn}
                  onClick={() => alert("Ответы сохранены (демо)")}
                >
                  Отправить ответы
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
