import type { ISurvey } from "../../surveys.component";
import MoreIcon from "../../../../assets/more-icon.svg";
import styles from "./survey-card.module.scss";

interface Props {
  survey: ISurvey;
}

export const SurveyCard = ({ survey }: Props) => {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <h3 className={styles.title}>{survey.title}</h3>
        <p className={styles.description}>{survey.description}</p>
      </div>

      <button className={styles.menu}>
        <img src={MoreIcon} alt="more" />
      </button>
    </div>
  );
};
