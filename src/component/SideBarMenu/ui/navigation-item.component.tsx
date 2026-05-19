import { Link } from "react-router-dom";
import type { IMenuItem } from "../navigation.types";
import styles from "../side-bar-menu.module.scss";
type TNavigationItemProps = IMenuItem & {
  isActive: boolean;
  badgeCount?: number;
  isCollapsed?: boolean;
};
export const NavigationItem = ({
  to,
  icon,
  label,
  isActive,
  badgeCount = 0,
  isCollapsed = false
}: TNavigationItemProps) => {
  return (
    <li
      className={`${styles["sidebar-menu__navigation-item"]} ${isActive ? styles["sidebar-menu__navigation-item--active"] : ""}`}
    >
      <Link to={to} title={isCollapsed ? label : undefined}>
        <img src={icon} alt="icon" />
        {!isCollapsed && (
          <span className={styles["sidebar-menu__navigation-label"]}>
            {label}
          </span>
        )}
        {badgeCount > 0 && (
          <span className={styles["sidebar-menu__navigation-badge"]}>
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        )}
      </Link>
    </li>
  );
};
