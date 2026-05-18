import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Footer } from "./footer.component";
import { Navigation } from "./navigation.component";
import styles from "../side-bar-menu.module.scss";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "sidebarCollapsed";

export const SideBarMenu = () => {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div
      className={`${styles["sidebar-menu"]} ${
        isCollapsed ? styles["sidebar-menu--collapsed"] : ""
      }`}
    >
      <button
        type="button"
        className={styles["sidebar-menu__collapse-button"]}
        onClick={() => setIsCollapsed((value) => !value)}
        aria-label={isCollapsed ? "Развернуть меню" : "Свернуть меню"}
        title={isCollapsed ? "Развернуть меню" : "Свернуть меню"}
      >
        {isCollapsed ? "›" : "‹"}
      </button>
      <Navigation pathname={pathname} isCollapsed={isCollapsed} />
      <Footer pathname={pathname} isCollapsed={isCollapsed} />
    </div>
  );
};
