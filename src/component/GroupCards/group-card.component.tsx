import styles from "./group-card.module.scss";

import HatIcon from "../../assets/hat-icon.svg";
import BellIcon from "../../assets/notification-card-icon.svg";
import MoreIcon from "../../assets/more-icon.svg";

export const GroupCard = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.actions}>
          <button className={styles.iconButton}>
            <img src={BellIcon} alt="notifications" />
          </button>

          <button className={styles.iconButton}>
            <img src={MoreIcon} alt="more" />
          </button>
        </div>

        <div className={styles.iconWrapper}>
          <img src={HatIcon} alt="group" />
        </div>

        <div className={styles.info}>
          <div className={styles.groupName}>22-ИТ-1</div>

          <div>
            <p className={styles.curator}>
              Куратор: <b>Коноплева Галина Филипповна</b>
            </p>

            <p className={styles.count}>
              Количество студентов: <b>22</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
