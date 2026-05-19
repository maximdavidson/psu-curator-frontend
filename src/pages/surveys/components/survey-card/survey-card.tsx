import { useState } from "react";
import MoreIcon from "../../../../assets/more-icon.svg";
import { useDeleteSurveyMutation } from "../../survey.api";
import type { SurveyListItem } from "../../survey.types";
import styles from "./survey-card.module.scss";
import { ViewSurveyModal } from "../view-survey-modal/view-survey-modal";
import { SurveyStatisticsModal } from "../survey-statistics-modal/survey-statistics-modal";
import { getUserIdFromAccessToken } from "@/shared/lib/jwt-claims";
interface Props {
  survey: SurveyListItem;
  onDeleted?: (id: string) => void;
}
export const SurveyCard = ({ survey, onDeleted }: Props) => {
  const [deleteSurvey, { isLoading }] = useDeleteSurveyMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTakeModalOpen, setIsTakeModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const currentUserId = getUserIdFromAccessToken(localStorage.getItem("token"));
  const isCreator =
    Boolean(currentUserId) &&
    Boolean(survey.createdByUserId) &&
    survey.createdByUserId === currentUserId;
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };
  const handleTake = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setIsTakeModalOpen(true);
  };
  const handleStatistics = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setIsStatsModalOpen(true);
  };
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    try {
      await deleteSurvey(survey.id).unwrap();
      onDeleted?.(survey.id);
    } catch (err) {
      console.error("Ошибка при удалении опроса:", err);
    }
  };
  return (
    <>
      <div className={styles.card}>
        <div className={styles.content}>
          <h3 className={styles.title}>{survey.title}</h3>
          <p className={styles.description}>{survey.description}</p>
          <p className={styles.meta}>
            {survey.questionCount} вопр. · {survey.responseCount} ответов
            {survey.isAnonymous ? " · анонимный" : ""}
          </p>
        </div>

        <div className={styles.menuWrapper}>
          <button
            className={styles.menu}
            onClick={toggleMenu}
            disabled={isLoading}
          >
            <img src={MoreIcon} alt="more" />
          </button>

          {isOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={handleTake}>
                Пройти опрос
              </button>
              {isCreator && (
                <button
                  className={styles.dropdownItem}
                  onClick={handleStatistics}
                >
                  Статистика
                </button>
              )}
              {isCreator && (
                <button className={styles.dropdownItem} onClick={handleDelete}>
                  Удалить
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ViewSurveyModal
        key={`take-${survey.id}`}
        isOpen={isTakeModalOpen}
        surveyId={survey.id}
        onClose={() => setIsTakeModalOpen(false)}
      />

      <SurveyStatisticsModal
        key={`stats-${survey.id}`}
        isOpen={isStatsModalOpen}
        surveyId={survey.id}
        onClose={() => setIsStatsModalOpen(false)}
      />
    </>
  );
};
