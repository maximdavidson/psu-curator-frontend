import { useDispatch, useSelector } from "react-redux";
import {
  selectIsDarkTheme,
  setTheme,
  type ThemeMode
} from "@/stores/theme.store";
import { ThemeToggle } from "./components/theme-toggle.component";
import styles from "./settings.module.scss";

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const isDark = useSelector(selectIsDarkTheme);

  const handleThemeChange = (dark: boolean) => {
    const mode: ThemeMode = dark ? "dark" : "light";
    dispatch(setTheme(mode));
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Настройки</h1>

      <section className={styles.section} aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className={styles.sectionTitle}>
          Внешний вид
        </h2>
        <p className={styles.sectionHint}>
          Настройки интерфейса сохраняются в этом браузере.
        </p>

        <div className={styles.row}>
          <div className={styles.rowText}>
            <span className={styles.rowLabel}>Тёмная тема</span>
            <span className={styles.rowDescription}>
              Комфортный режим при слабом освещении
            </span>
          </div>
          <ThemeToggle checked={isDark} onChange={handleThemeChange} />
        </div>
      </section>
    </div>
  );
};
