import { useState } from "react";
import MoreIcon from "../../../../assets/more-icon.svg";
import { useDeleteSurveyMutation } from "../../survey.api";
import type { ISurvey } from "../../survey.types";
import styles from "./survey-card.module.scss";
import { ViewSurveyModal } from "../view-survey-modal/view-survey-modal";

interface Props {
  survey: ISurvey;
  onDeleted?: (id: string) => void;
}

export const SurveyCard = ({ survey, onDeleted }: Props) => {
  const [deleteSurvey, { isLoading }] = useDeleteSurveyMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setIsViewModalOpen(true);
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
              <button className={styles.dropdownItem} onClick={handleView}>
                Просмотреть
              </button>
              <button className={styles.dropdownItem} onClick={handleDelete}>
                Удалить
              </button>
            </div>
          )}
        </div>
      </div>

      <ViewSurveyModal
        key={survey.id}
        isOpen={isViewModalOpen}
        surveyId={survey.id}
        onClose={() => setIsViewModalOpen(false)}
      />
    </>
  );
};
