import { useNavigate } from "react-router-dom";
import styles from "./group-card.module.scss";
import HatIcon from "../../assets/hat-icon.svg";
import BellIcon from "../../assets/notification-card-icon.svg";
import MoreIcon from "../../assets/more-icon.svg";

interface GroupCardProps {
  curator: string;
  groupName: string;
  numberStudents: number;
  groupId: string;
}

export const GroupCard = ({
  curator,
  groupName,
  numberStudents,
  groupId
}: GroupCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className={styles.wrapper} onClick={handleClick}>
      <div className={styles.card}>
        <div className={styles.actions}>
          <button
            className={styles.iconButton}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={BellIcon} alt="notifications" />
          </button>

          <button
            className={styles.iconButton}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={MoreIcon} alt="more" />
          </button>
        </div>

        <div className={styles.iconWrapper}>
          <img src={HatIcon} alt="group" />
        </div>

        <div className={styles.info}>
          <div className={styles.groupName}>{groupName}</div>
          <div>
            <p className={styles.curator}>
              Куратор: <b>{curator}</b>
            </p>
            <p className={styles.count}>
              Количество студентов: <b>{numberStudents}</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
