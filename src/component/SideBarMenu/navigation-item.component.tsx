import { Link } from "react-router-dom";
import type { IMenuItem } from "./navigation.types";
import styles from "./side-bar-menu.module.scss";
type TNavigationItemProps = IMenuItem & {
  isActive: boolean;
};

export const NavigationItem = ({
  to,
  icon,
  label,
  isActive
}: TNavigationItemProps) => {
  return (
    <li
      className={`${styles["sidebar-menu__item"]} ${isActive ? styles["sidebar-menu__item--active"] : ""}`} // TODO:  add clsx
    >
      <Link to={to}>
        <img src={icon} alt="icon" />
        <span>{label}</span>
      </Link>
    </li>
  );
};
