import { useEffect, useState } from "react";
import styles from "./view-survey-modal.module.scss";
import {
  useGetSurveyByIdQuery,
  useSubmitSurveyResponseMutation
} from "../../survey.api";
import type { Question, QuestionAnswerPayload } from "../../survey.types";

interface ViewSurveyModalProps {
  isOpen: boolean;
  surveyId: string;
  onClose: () => void;
}

export const ViewSurveyModal = ({
  isOpen,
  surveyId,
  onClose
}: ViewSurveyModalProps) => {
  const {
    data: survey,
    isLoading,
    refetch
  } = useGetSurveyByIdQuery(surveyId, {
    skip: !isOpen || !surveyId
  });
  const [submitResponse, { isLoading: isSubmitting }] =
    useSubmitSurveyResponseMutation();

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers({});
      setSubmitError(null);
    }
  }, [isOpen, surveyId]);

  if (!isOpen) return null;

  const alreadyResponded = survey?.hasCurrentUserResponded ?? false;

  const handleSingleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultipleAnswer = (
    questionId: string,
    option: string,
    checked: boolean
  ) => {
    const current = (answers[questionId] as string[]) || [];
    if (checked) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: [...current, option]
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: current.filter((o) => o !== option)
      }));
    }
  };

  const handleTextAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const buildPayload = (): QuestionAnswerPayload[] | null => {
    if (!survey?.questions?.length) return null;

    const payload: QuestionAnswerPayload[] = [];

    for (const question of survey.questions) {
      const raw = answers[question.id];

      if (question.type === "text") {
        const text = typeof raw === "string" ? raw.trim() : "";
        if (!text) return null;
        payload.push({
          questionId: question.id,
          selectedOptions: [],
          textValue: text
        });
        continue;
      }

      if (question.type === "single") {
        if (typeof raw !== "string" || !raw) return null;
        payload.push({
          questionId: question.id,
          selectedOptions: [raw]
        });
        continue;
      }

      if (question.type === "multiple") {
        const selected = Array.isArray(raw) ? raw : [];
        if (selected.length === 0) return null;
        payload.push({
          questionId: question.id,
          selectedOptions: selected
        });
      }
    }

    return payload.length === survey.questions.length ? payload : null;
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    const payload = buildPayload();
    if (!payload) {
      setSubmitError("Ответьте на все вопросы перед отправкой.");
      return;
    }

    try {
      await submitResponse({ surveyId, body: { answers: payload } }).unwrap();
      await refetch();
    } catch {
      setSubmitError("Не удалось отправить ответы. Попробуйте позже.");
    }
  };

  const renderQuestion = (question: Question) => {
    const qid = question.id;

    switch (question.type) {
      case "single":
        return (
          <div className={styles.optionsGroup}>
            {question.options.map((opt, optIdx) => (
              <label key={optIdx} className={styles.radioLabel}>
                <input
                  type="radio"
                  name={`question_${qid}`}
                  value={opt}
                  checked={answers[qid] === opt}
                  disabled={alreadyResponded}
                  onChange={(e) => handleSingleAnswer(qid, e.target.value)}
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
              const selected = (answers[qid] as string[]) || [];
              return (
                <label key={optIdx} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    disabled={alreadyResponded}
                    onChange={(e) =>
                      handleMultipleAnswer(qid, opt, e.target.checked)
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
            value={(answers[qid] as string) || ""}
            disabled={alreadyResponded}
            onChange={(e) => handleTextAnswer(qid, e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  const handleClose = () => {
    setAnswers({});
    setSubmitError(null);
    onClose();
  };

  const canSubmit =
    !alreadyResponded && !isSubmitting && buildPayload() !== null;

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

          {alreadyResponded && (
            <p className={styles.alreadyAnswered}>
              Вы уже прошли этот опрос. Повторная отправка недоступна.
            </p>
          )}

          {isLoading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            <>
              <div className={styles.questions}>
                {survey?.questions.map((question, idx) => (
                  <div key={question.id} className={styles.question}>
                    <div className={styles.questionText}>
                      {idx + 1}. {question.text}
                    </div>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>

              {submitError && (
                <p className={styles.submitError}>{submitError}</p>
              )}

              {!alreadyResponded && (
                <div className={styles.footer}>
                  <button
                    className={styles.submitBtn}
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? "Отправка..." : "Отправить ответы"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
