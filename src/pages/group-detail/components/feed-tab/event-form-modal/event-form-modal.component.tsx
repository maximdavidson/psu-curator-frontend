import { useState } from "react";
import styles from "./event-form-modal.module.scss";
import { useGetUserFilesQuery } from "@/pages/documents/documents.api";
import { useGetUserSurveysQuery } from "@/pages/surveys/survey.api";
import { getUserIdFromAccessToken } from "@/shared/lib/jwt-claims";
interface Props {
  onClose: () => void;
  onCreate: (item: {
    title: string;
    description?: string;
    contentType: "message" | "poll" | "file";
    selectedFileIds?: string[];
    selectedSurveyId?: string;
  }) => void | Promise<void>;
  initialData?: {
    title: string;
    description?: string;
    contentType?: "message" | "poll" | "file";
    selectedSurveyId?: string | null;
    selectedFileId?: string | null;
  };
  mode?: "create" | "edit";
}
export const EventFormModal = ({
  onClose,
  onCreate,
  initialData,
  mode = "create"
}: Props) => {
  const userId = getUserIdFromAccessToken(localStorage.getItem("token")) ?? "";
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [contentType, setContentType] = useState<"message" | "poll" | "file">(
    initialData?.contentType || "message"
  );
  const { data: userFiles, isLoading: isFilesLoading } = useGetUserFilesQuery();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    initialData?.selectedFileId ?? null
  );
  const { data: surveys, isLoading: isSurveysLoading } = useGetUserSurveysQuery(
    userId,
    { skip: !userId }
  );
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(
    initialData?.selectedSurveyId ?? null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const getFileExtension = (fileName: string): string => {
    return fileName.split(".").pop()?.toUpperCase() || "";
  };
  const getFileIcon = (contentType: string): string => {
    if (contentType.startsWith("image/")) return "🖼️";
    if (contentType === "application/pdf") return "📕";
    if (contentType.includes("word") || contentType.includes("document"))
      return "📝";
    return "📄";
  };
  const getQuestionCountText = (count: number): string => {
    if (!count || count === 0) return "0 вопросов";
    if (count === 1) return "1 вопрос";
    if (count >= 2 && count <= 4) return `${count} вопроса`;
    return `${count} вопросов`;
  };
  const safeSurveys = surveys || [];
  const safeFiles = userFiles?.files ?? [];
  const handleSubmit = async () => {
    setSubmitError(null);
    if (!title.trim()) {
      setSubmitError("Укажите заголовок");
      return;
    }
    if (contentType === "poll" && !selectedSurveyId) {
      setSubmitError("Выберите опрос из списка");
      return;
    }
    if (contentType === "file" && !selectedFileId) {
      setSubmitError("Выберите файл из списка");
      return;
    }
    setIsSubmitting(true);
    try {
      await Promise.resolve(
        onCreate({
          title,
          description: contentType === "message" ? description : undefined,
          contentType,
          selectedFileIds:
            contentType === "file" && selectedFileId
              ? [selectedFileId]
              : undefined,
          selectedSurveyId:
            contentType === "poll" && selectedSurveyId
              ? selectedSurveyId
              : undefined
        })
      );
      setSelectedFileId(null);
      setSelectedSurveyId(null);
    } catch {
      setSubmitError("Не удалось сохранить. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleContentTypeChange = (type: "message" | "poll" | "file") => {
    setSubmitError(null);
    setContentType(type);
    if (type !== "message") setDescription("");
    setSelectedFileId(null);
    setSelectedSurveyId(null);
  };
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>
          {mode === "edit" ? "Редактировать запись" : "Создать запись"}
        </h2>

        <div className={styles.contentTypeSelector}>
          <button
            className={`${styles.typeButton} ${contentType === "message" ? styles.active : ""}`}
            onClick={() => handleContentTypeChange("message")}
          >
            Сообщение
          </button>
          <button
            className={`${styles.typeButton} ${contentType === "poll" ? styles.active : ""}`}
            onClick={() => handleContentTypeChange("poll")}
          >
            Опрос
          </button>
          <button
            className={`${styles.typeButton} ${contentType === "file" ? styles.active : ""}`}
            onClick={() => handleContentTypeChange("file")}
          >
            Файл
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Заголовок</label>
          <input
            type="text"
            placeholder={
              contentType === "poll"
                ? "Название для опроса в ленте"
                : contentType === "file"
                  ? "Название материала"
                  : "Введите заголовок"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            autoFocus
          />
        </div>

        {contentType === "message" && (
          <div className={styles.field}>
            <label className={styles.label}>Описание</label>
            <textarea
              placeholder="Введите описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={4}
            />
          </div>
        )}

        {contentType === "poll" && (
          <div className={styles.fileSection}>
            <label className={styles.label}>Выберите опрос</label>

            {isSurveysLoading && (
              <p className={styles.loadingText}>Загрузка списка опросов...</p>
            )}

            {!isSurveysLoading && safeSurveys.length === 0 && (
              <div className={styles.noFiles}>
                <p>У вас пока нет созданных опросов</p>
                <p className={styles.noFilesHint}>
                  Перейдите на страницу "Опросы", чтобы создать опрос
                </p>
              </div>
            )}

            {!isSurveysLoading && safeSurveys.length > 0 && (
              <div className={styles.fileList}>
                {safeSurveys.map((survey) => {
                  const isSelected = selectedSurveyId === survey.id;
                  const questionsCount = survey.questionCount ?? 0;
                  return (
                    <div
                      key={survey.id}
                      className={`${styles.fileItem} ${isSelected ? styles.fileItemSelected : ""}`}
                      onClick={() =>
                        setSelectedSurveyId(isSelected ? null : survey.id)
                      }
                    >
                      <div className={styles.radioButton}>
                        <div
                          className={`${styles.radioCircle} ${isSelected ? styles.radioSelected : ""}`}
                        />
                      </div>

                      <span className={styles.fileItemIcon}>📊</span>

                      <div className={styles.fileItemInfo}>
                        <span className={styles.fileItemName}>
                          {survey.title}
                        </span>
                        <span className={styles.fileItemMeta}>
                          {survey.description || "Без описания"} •{" "}
                          {getQuestionCountText(questionsCount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {contentType === "file" && (
          <div className={styles.fileSection}>
            <label className={styles.label}>Выберите файл</label>

            {isFilesLoading && (
              <p className={styles.loadingText}>Загрузка списка файлов...</p>
            )}

            {!isFilesLoading && safeFiles.length === 0 && (
              <div className={styles.noFiles}>
                <p>У вас пока нет загруженных файлов</p>
                <p className={styles.noFilesHint}>
                  Перейдите на страницу "Документы", чтобы загрузить файлы
                </p>
              </div>
            )}

            {!isFilesLoading && safeFiles.length > 0 && (
              <div className={styles.fileList}>
                {safeFiles.map((file) => {
                  const isSelected = selectedFileId === file.id;
                  return (
                    <div
                      key={file.id}
                      className={`${styles.fileItem} ${isSelected ? styles.fileItemSelected : ""}`}
                      onClick={() =>
                        setSelectedFileId(isSelected ? null : file.id)
                      }
                    >
                      <div className={styles.radioButton}>
                        <div
                          className={`${styles.radioCircle} ${isSelected ? styles.radioSelected : ""}`}
                        />
                      </div>

                      <span className={styles.fileItemIcon}>
                        {getFileIcon(file.contentType)}
                      </span>

                      <div className={styles.fileItemInfo}>
                        <span className={styles.fileItemName}>
                          {file.fileName}
                        </span>
                        <span className={styles.fileItemMeta}>
                          {getFileExtension(file.fileName)} •{" "}
                          {formatFileSize(file.fileSize)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          {submitError && (
            <p className={styles.submitError} role="alert">
              {submitError}
            </p>
          )}
          <button onClick={onClose} className={styles.cancelButton}>
            Отмена
          </button>
          <button
            onClick={() => void handleSubmit()}
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Сохранение…"
              : mode === "edit"
                ? "Сохранить"
                : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
};
