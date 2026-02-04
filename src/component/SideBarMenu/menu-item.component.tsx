import { Link } from "react-router-dom";
import type { IMenuItem } from "./menu.types";
import styles from "./side-bar-menu.module.scss";
type TMenuItemProps = IMenuItem & {
  isActive: boolean;
};

export const MenuItem = ({ to, icon, label, isActive }: TMenuItemProps) => {
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
