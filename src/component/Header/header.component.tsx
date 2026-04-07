import { useState } from "react";
import styles from "./header.module.scss";

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

export const Header = () => {
  const [text, setText] = useState<string>("");

  const email = getUserEmail();
  const initials = getInitialsFromEmail(email);

  const search = (value: string) => {
    setText(value);
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <img className={styles.PSU_icon} src="./icons/Psu-icon.svg" alt="" />
        <h2 className={styles.PSU_text}>PSU Curator</h2>
      </div>

      <div className={`${styles.center} ${styles.search}`}>
        <img
          className={styles.search_icon}
          src="./icons/Search-icon.svg"
          alt=""
        />
        <input
          className={styles.search_input}
          type="text"
          placeholder="Поиск по группам..."
          onChange={(e) => search(e.target.value)}
          value={text}
        />
      </div>

      <div className={styles.right}>
        <img className={styles.bell} src="./icons/Bell-icon.svg" />
        <div className={styles.user_icon}>{initials}</div>
      </div>
    </header>
  );
};
