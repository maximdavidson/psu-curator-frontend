/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
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

const formatRemaining = (totalSeconds: number): string => {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const buildAnswerPayload = (
  questions: Question[],
  answers: Record<string, string | string[]>,
  requireAll: boolean
): QuestionAnswerPayload[] | null => {
  if (!questions.length) return null;
  const payload: QuestionAnswerPayload[] = [];
  for (const question of questions) {
    const raw = answers[question.id];
    if (question.type === "text") {
      const text = typeof raw === "string" ? raw.trim() : "";
      if (!text) {
        if (requireAll) return null;
        continue;
      }
      payload.push({
        questionId: question.id,
        selectedOptions: [],
        textValue: text
      });
      continue;
    }
    if (question.type === "single") {
      if (typeof raw !== "string" || !raw) {
        if (requireAll) return null;
        continue;
      }
      payload.push({
        questionId: question.id,
        selectedOptions: [raw]
      });
      continue;
    }
    if (question.type === "multiple") {
      const selected = Array.isArray(raw) ? raw : [];
      if (selected.length === 0) {
        if (requireAll) return null;
        continue;
      }
      payload.push({
        questionId: question.id,
        selectedOptions: selected
      });
    }
  }
  if (requireAll) {
    return payload.length === questions.length ? payload : null;
  }
  return payload;
};

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
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const hasDeadline = Boolean(survey?.deadlineAt);

  useEffect(() => {
    if (!isOpen) {
      startTransition(() => {
        setAnswers({});
        setSubmitError(null);
        setRemainingSeconds(null);
      });
    }
  }, [isOpen, surveyId]);

  useEffect(() => {
    if (!survey?.deadlineAt || survey.hasCurrentUserResponded) {
      setRemainingSeconds(null);
      return;
    }

    const updateRemaining = () => {
      const expiresAt = new Date(survey.deadlineAt!).getTime();
      const diff = Math.floor((expiresAt - Date.now()) / 1000);
      setRemainingSeconds(Math.max(0, diff));
    };

    updateRemaining();
    const timerId = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timerId);
  }, [survey?.deadlineAt, survey?.hasCurrentUserResponded]);

  const alreadyResponded = survey?.hasCurrentUserResponded ?? false;
  const isTimeExpired =
    survey?.isTimeExpired === true ||
    (remainingSeconds !== null && remainingSeconds <= 0);

  const submitAnswers = useCallback(async () => {
    if (!survey?.questions?.length) return;
    setSubmitError(null);
    const payload = buildAnswerPayload(survey.questions, answers, true);
    if (!payload) {
      setSubmitError("Ответьте на все вопросы перед отправкой.");
      return;
    }
    if (isTimeExpired) {
      setSubmitError("Срок прохождения опроса истёк.");
      return;
    }
    try {
      await submitResponse({
        surveyId,
        body: { answers: payload }
      }).unwrap();
      await refetch();
    } catch {
      setSubmitError("Не удалось отправить ответы. Попробуйте позже.");
    }
  }, [
    survey?.questions,
    answers,
    isTimeExpired,
    surveyId,
    submitResponse,
    refetch
  ]);

  const timerLabel = useMemo(() => {
    if (!hasDeadline || alreadyResponded) return null;
    if (remainingSeconds === null) return null;
    if (isTimeExpired) {
      return "Срок прохождения опроса истёк";
    }
    return `До завершения опроса: ${formatRemaining(remainingSeconds)}`;
  }, [hasDeadline, alreadyResponded, remainingSeconds, isTimeExpired]);

  if (!isOpen) return null;

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

  const handleSubmit = async () => {
    await submitAnswers();
  };

  const inputsDisabled = alreadyResponded || isTimeExpired;

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
                  disabled={inputsDisabled}
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
                    disabled={inputsDisabled}
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
            disabled={inputsDisabled}
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

  const fullPayload =
    survey?.questions && buildAnswerPayload(survey.questions, answers, true);

  const canSubmit =
    !alreadyResponded &&
    !isSubmitting &&
    !isTimeExpired &&
    fullPayload !== null;

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

          {hasDeadline && !alreadyResponded && timerLabel && (
            <p
              className={
                isTimeExpired
                  ? styles.timeExpiredBanner
                  : styles.timeLimitBanner
              }
            >
              {timerLabel}
            </p>
          )}

          {survey && survey.isAnonymous && (
            <p className={styles.privacyNote}>
              Этот опрос анонимный: автор видит только общую статистику, без
              привязки ответов к вашему имени.
            </p>
          )}

          {survey && !survey.isAnonymous && (
            <p className={styles.privacyNote}>
              Этот опрос не анонимный: автор опроса увидит ваши ответы с
              указанием ФИО в статистике.
            </p>
          )}

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

              {!alreadyResponded && !isTimeExpired && (
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
