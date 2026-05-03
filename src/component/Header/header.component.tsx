import { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./header.module.scss";
import { setSearchText } from "@/app/store/searchStore";
import { NotificationDropdown } from "../NotificationDropdown/notification-dropdown.component";

const getUserEmail = (): string => {
  return localStorage.getItem("email") || "";
};

const getInitialsFromEmail = (email: string): string => {
  if (!email) return "??";
  const namePart = email.split("@")[0];
  const parts = namePart.split(/[._-]/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return namePart.slice(0, 2).toUpperCase();
};

const getPlaceholderByPath = (path: string): string => {
  if (path.startsWith("/groups") && path !== "/groups") {
    return "Поиск по студентам...";
  }
  if (path === "/groups") {
    return "Поиск по группам...";
  }
  if (path === "/surveys") {
    return "Поиск по опросам...";
  }
  if (path === "/documents") {
    return "Поиск по документам...";
  }
  return "Поиск...";
};

const shouldShowSearch = (path: string): boolean => {
  return path !== "/calendar";
};

export const Header = () => {
  const [text, setText] = useState<string>("");
  const location = useLocation();

  const email = getUserEmail();
  const initials = getInitialsFromEmail(email);
  const placeholder = getPlaceholderByPath(location.pathname);
  const showSearch = shouldShowSearch(location.pathname);

  const handleSearch = (value: string) => {
    setText(value);
    setSearchText(value);
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <img className={styles.PSU_icon} src="./icons/Psu-icon.svg" alt="" />
        <h2 className={styles.PSU_text}>PSU Curator</h2>
      </div>

      {showSearch && (
        <div className={`${styles.center} ${styles.search}`}>
          <img
            className={styles.search_icon}
            src="./icons/Search-icon.svg"
            alt=""
          />
          <input
            className={styles.search_input}
            type="text"
            placeholder={placeholder}
            onChange={(e) => handleSearch(e.target.value)}
            value={text}
          />
        </div>
      )}

      <div className={styles.right}>
        <NotificationDropdown />
        <div className={styles.user_icon}>{initials}</div>
      </div>
    </header>
  );
};
