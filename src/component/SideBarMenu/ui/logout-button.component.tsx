import LogoutIcon from "@/assets/logout-icon.svg";
import styles from "../side-bar-menu.module.scss";
import { useLogout } from "@/hooks/use-logout";

export const LogoutButton = () => {
  const logout = useLogout();

  return (
    <li className={styles["sidebar-menu__navigation-item"]}>
      <button onClick={logout}>
        <img src={LogoutIcon} alt="settings" />
        <span>Выход</span>
      </button>
    </li>
  );
};
