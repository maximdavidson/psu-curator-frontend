import { useState } from "react";
import styles from "./header.module.scss";

export const Header = () => {
  const [text, setText] = useState<string>("");

  const search = (value: string) => {
    setText(value);

    //
  };

  return (
    <>
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
          <div className={styles.user_icon}>MD</div>
        </div>
      </header>
    </>
  );
};
