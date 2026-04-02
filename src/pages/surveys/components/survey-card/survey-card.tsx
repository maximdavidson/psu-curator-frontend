import MoreIcon from "../../../../assets/more-icon.svg";
import { useDeleteSurveyMutation } from "../../survey.api";
import type { ISurvey } from "../../survey.types";
import styles from "./survey-card.module.scss";

interface Props {
  survey: ISurvey;
  onDeleted?: (id: string) => void; // callback после удаления
}

export const SurveyCard = ({ survey, onDeleted }: Props) => {
  const [deleteSurvey, { isLoading }] = useDeleteSurveyMutation();

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить опрос?")) return;

    try {
      await deleteSurvey(survey.id).unwrap();
      onDeleted?.(survey.id);
    } catch (err) {
      console.error("Ошибка при удалении опроса:", err);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <h3 className={styles.title}>{survey.title}</h3>
        <p className={styles.description}>{survey.description}</p>
      </div>

      <button
        className={styles.menu}
        onClick={handleDelete}
        disabled={isLoading}
      >
        <img src={MoreIcon} alt="more" />
      </button>
    </div>
  );
};
