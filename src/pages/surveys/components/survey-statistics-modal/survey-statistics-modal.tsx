import { useState } from "react";
import styles from "./survey-statistics-modal.module.scss";
import {
  type SurveyStatisticsExportFormat,
  useDownloadSurveyStatisticsMutation,
  useGetSurveyStatisticsQuery
} from "../../survey.api";
interface SurveyStatisticsModalProps {
  isOpen: boolean;
  surveyId: string;
  onClose: () => void;
}
export const SurveyStatisticsModal = ({
  isOpen,
  surveyId,
  onClose
}: SurveyStatisticsModalProps) => {
  const { data, isLoading, isError } = useGetSurveyStatisticsQuery(surveyId, {
    skip: !isOpen || !surveyId
  });
  const [downloadError, setDownloadError] = useState("");
  const [downloadStatistics, { isLoading: isDownloading }] =
    useDownloadSurveyStatisticsMutation();
  const handleDownload = async (format: SurveyStatisticsExportFormat) => {
    try {
      setDownloadError("");
      const blob = await downloadStatistics({ surveyId, format }).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `survey-${surveyId}-statistics.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Не удалось скачать файл со статистикой.");
    }
  };
  if (!isOpen) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{data?.title ?? "Статистика опроса"}</h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {isLoading && <p className={styles.status}>Загрузка...</p>}
        {isError && (
          <p className={styles.status}>Не удалось загрузить статистику.</p>
        )}

        {data && !isLoading && (
          <div className={styles.content}>
            <p className={styles.summary}>
              Всего ответов: <strong>{data.totalResponses}</strong>
            </p>
            <p className={styles.modeLine}>
              {data.isAnonymous
                ? "Режим: анонимный — в списке ниже не указываются ФИО участников."
                : "Режим: неанонимный — для вопросов с вариантами ответов показаны ответы каждого участника."}
            </p>

            <div className={styles.exportActions}>
              <button
                type="button"
                className={styles.exportBtn}
                disabled={isDownloading}
                onClick={() => handleDownload("docx")}
              >
                Скачать Word
              </button>
              <button
                type="button"
                className={styles.exportBtn}
                disabled={isDownloading}
                onClick={() => handleDownload("pdf")}
              >
                Скачать PDF
              </button>
            </div>
            {downloadError && (
              <p className={styles.downloadError}>{downloadError}</p>
            )}

            {data.questions.map((question, idx) => (
              <section
                key={question.questionId}
                className={styles.questionBlock}
              >
                <h3>
                  {idx + 1}. {question.text}
                </h3>
                <p className={styles.meta}>
                  Ответили: {question.answeredCount}
                </p>

                {question.optionStats && question.optionStats.length > 0 && (
                  <ul className={styles.optionList}>
                    {question.optionStats.map((opt) => (
                      <li key={opt.option} className={styles.optionRow}>
                        <span className={styles.optionLabel}>{opt.option}</span>
                        <div className={styles.barTrack}>
                          <div
                            className={styles.barFill}
                            style={{
                              width: `${Math.min(opt.percentage, 100)}%`
                            }}
                          />
                        </div>
                        <span className={styles.optionCount}>
                          {opt.count} ({opt.percentage}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {question.respondentChoiceAnswers &&
                  question.respondentChoiceAnswers.length > 0 && (
                    <div className={styles.respondentBlock}>
                      <h4 className={styles.respondentTitle}>
                        Ответы по участникам
                      </h4>
                      <ul className={styles.respondentList}>
                        {question.respondentChoiceAnswers.map((row, ri) => (
                          <li
                            key={`${row.respondentName}-${row.submittedAt}-${ri}`}
                          >
                            <span className={styles.respondent}>
                              {row.respondentName}
                            </span>
                            <span className={styles.respondentMeta}>
                              {new Date(row.submittedAt).toLocaleString(
                                "ru-RU"
                              )}
                            </span>
                            <p className={styles.respondentChoices}>
                              {row.selectedOptions.join(", ")}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {question.textAnswers && question.textAnswers.length > 0 && (
                  <ul className={styles.textList}>
                    {question.textAnswers.map((item, i) => (
                      <li key={`${item.submittedAt}-${i}`}>
                        <span className={styles.respondent}>
                          {item.respondentName}
                        </span>
                        <p>{item.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
