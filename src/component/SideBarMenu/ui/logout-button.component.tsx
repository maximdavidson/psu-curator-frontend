import LogoutIcon from "@/assets/logout-icon.svg";
import styles from "../side-bar-menu.module.scss";

export const LogoutButton = () => {
  // TODO: implement logout logic

  return (
    <li className={styles["sidebar-menu__navigation-item"]}>
      <button>
        <img src={LogoutIcon} alt="settings" />
        <span>Выход</span>
      </button>
    </li>
  );
};
