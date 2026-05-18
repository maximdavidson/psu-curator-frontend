import LogoutIcon from "@/assets/logout-icon.svg";
import styles from "../side-bar-menu.module.scss";
import { useLogout } from "@/hooks/use-logout";

interface LogoutButtonProps {
  isCollapsed?: boolean;
}

export const LogoutButton = ({ isCollapsed = false }: LogoutButtonProps) => {
  const logout = useLogout();

  return (
    <li className={styles["sidebar-menu__navigation-item"]}>
      <button
        type="button"
        onClick={logout}
        title={isCollapsed ? "Выход" : undefined}
      >
        <img src={LogoutIcon} alt="settings" />
        {!isCollapsed && <span>Выход</span>}
      </button>
    </li>
  );
};
