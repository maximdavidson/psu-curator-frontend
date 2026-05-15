import styles from "./survey-statistics-modal.module.scss";
import { useGetSurveyStatisticsQuery } from "../../survey.api";

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
