import { useState, useEffect } from "react";
import styles from "./create-survey-modal.module.scss";
import { nanoid } from "nanoid";
import * as yup from "yup";
import { surveySchema } from "@/shared/model/schemas/create-survey-modal.schema";
import type { Question, QuestionType } from "../../survey.types";
export interface CreateSurveyPayload {
  title: string;
  description: string;
  isAnonymous: boolean;
  deadlineAt?: string | null;
  timeLimitMinutes?: number | null;
  questions: {
    text: string;
    type: QuestionType;
    options: string[];
  }[];
}
export interface SurveyData extends CreateSurveyPayload {
  questions: Question[];
}
interface Props {
  onClose: () => void;
  onCreate: (data: CreateSurveyPayload) => void | Promise<void>;
  isLoading?: boolean;
}
const toDatetimeLocalValue = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
export const CreateSurveyModal = ({
  onClose,
  onCreate,
  isLoading = false
}: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadlineAt, setDeadlineAt] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { id: nanoid(), text: "", type: "single", options: ["", ""] }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [authError, setAuthError] = useState<string>("");
  useEffect(() => {
    const validate = async () => {
      try {
        await surveySchema.validate(
          {
            title,
            description,
            isAnonymous,
            hasDeadline,
            deadlineAt,
            questions
          },
          { abortEarly: false }
        );
        setErrors({});
        setIsValid(true);
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const errs: Record<string, string> = {};
          error.inner.forEach((e: yup.ValidationError) => {
            if (e.path && e.message) {
              const key = e.path.replace(/\.(\d+)\./g, "[$1].");
              errs[key] = e.message;
            }
          });
          setErrors(errs);
          setIsValid(false);
        }
      }
    };
    validate();
  }, [title, description, isAnonymous, hasDeadline, deadlineAt, questions]);
  const handleQuestionChange = (
    id: string,
    field: keyof Question,
    value: string | Question["type"] | string[]
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };
  const handleOptionChange = (
    questionId: string,
    index: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o, i) => (i === index ? value : o))
            }
          : q
      )
    );
  };
  const addOption = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, ""] } : q
      )
    );
  };
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: nanoid(), text: "", type: "single", options: ["", ""] }
    ]);
  };
  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };
  const handleFieldTouch = (field: string) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  };
  const getError = (path: string) =>
    touchedFields.has(path) ? errors[path] : undefined;
  const shouldShowFieldError = (path: string) =>
    touchedFields.has(path) && errors[path];
  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    setAuthError("");
    try {
      const payload: CreateSurveyPayload = {
        title,
        description,
        isAnonymous,
        deadlineAt: hasDeadline ? new Date(deadlineAt).toISOString() : null,
        timeLimitMinutes: null,
        questions: questions.map((q) => ({
          text: q.text,
          type: q.type,
          options:
            q.type === "text"
              ? []
              : q.options.filter((opt) => opt.trim() !== "")
        }))
      };
      await onCreate(payload);
      setTitle("");
      setDescription("");
      setIsAnonymous(false);
      setHasDeadline(false);
      setDeadlineAt("");
      setQuestions([
        { id: nanoid(), text: "", type: "single", options: ["", ""] }
      ]);
      onClose();
    } catch (err) {
      console.error("Ошибка при создании опроса:", err);
      setAuthError("Ошибка при создании опроса. Попробуйте позже.");
      setTimeout(() => setAuthError(""), 3000);
    }
  };
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Создать опрос</h2>

        {authError && <div className={styles.authError}>{authError}</div>}

        <div className={styles.field}>
          <input
            className={shouldShowFieldError("title") ? styles.error : ""}
            placeholder="Название опроса"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleFieldTouch("title")}
          />
          {getError("title") && (
            <span className={styles.errorText}>{getError("title")}</span>
          )}
        </div>

        <div className={styles.field}>
          <textarea
            className={shouldShowFieldError("description") ? styles.error : ""}
            placeholder="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => handleFieldTouch("description")}
          />
          {getError("description") && (
            <span className={styles.errorText}>{getError("description")}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <span>
              Анонимный опрос (в статистике не будут видны ФИО и ответы по
              каждому участнику)
            </span>
          </label>
        </div>

        <div className={styles.field}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={hasDeadline}
              onChange={(e) => setHasDeadline(e.target.checked)}
            />
            <span>Указать дату, до которой нужно пройти опрос</span>
          </label>
          {hasDeadline && (
            <div className={styles.timeLimitRow}>
              <input
                className={
                  shouldShowFieldError("deadlineAt") ? styles.error : ""
                }
                type="datetime-local"
                min={toDatetimeLocalValue(new Date())}
                value={deadlineAt}
                onChange={(e) => setDeadlineAt(e.target.value)}
                onBlur={() => handleFieldTouch("deadlineAt")}
              />
              <span>после этой даты пройти опрос будет нельзя</span>
            </div>
          )}
          {getError("deadlineAt") && (
            <span className={styles.errorText}>{getError("deadlineAt")}</span>
          )}
        </div>

        <hr />

        {questions.map((q, idx) => (
          <div key={q.id} className={styles.question}>
            <div className={styles.questionHeader}>
              <h4>Вопрос {idx + 1}</h4>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(q.id)}>
                  Удалить
                </button>
              )}
            </div>

            <div className={styles.field}>
              <input
                className={
                  shouldShowFieldError(`questions[${idx}].text`)
                    ? styles.error
                    : ""
                }
                placeholder="Текст вопроса"
                value={q.text}
                onChange={(e) =>
                  handleQuestionChange(q.id, "text", e.target.value)
                }
                onBlur={() => handleFieldTouch(`questions[${idx}].text`)}
              />
              {getError(`questions[${idx}].text`) && (
                <span className={styles.errorText}>
                  {getError(`questions[${idx}].text`)}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <select
                className={
                  shouldShowFieldError(`questions[${idx}].type`)
                    ? styles.error
                    : ""
                }
                value={q.type}
                onChange={(e) =>
                  handleQuestionChange(
                    q.id,
                    "type",
                    e.target.value as Question["type"]
                  )
                }
                onBlur={() => handleFieldTouch(`questions[${idx}].type`)}
              >
                <option value="single">Один ответ</option>
                <option value="multiple">Несколько ответов</option>
                <option value="text">Свой ответ</option>
              </select>
              {getError(`questions[${idx}].type`) && (
                <span className={styles.errorText}>
                  {getError(`questions[${idx}].type`)}
                </span>
              )}
            </div>

            {q.type !== "text" && (
              <div className={styles.options}>
                <h5>Варианты ответов</h5>
                {q.options.map((opt, i) => (
                  <div key={i} className={styles.field}>
                    <input
                      className={
                        shouldShowFieldError(`questions[${idx}].options`)
                          ? styles.error
                          : ""
                      }
                      placeholder={`Вариант ${i + 1}`}
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(q.id, i, e.target.value)
                      }
                      onBlur={() =>
                        handleFieldTouch(`questions[${idx}].options`)
                      }
                    />
                  </div>
                ))}
                <button type="button" onClick={() => addOption(q.id)}>
                  + Добавить вариант
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          className={styles.addQuestionBtn}
          type="button"
          onClick={addQuestion}
        >
          + Добавить вопрос
        </button>

        <div className={styles.actions}>
          <button type="button" onClick={onClose}>
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Создание..." : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
};
