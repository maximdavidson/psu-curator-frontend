import styles from "../settings.module.scss";
interface ThemeToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
export const ThemeToggle = ({
  checked,
  onChange,
  disabled = false
}: ThemeToggleProps) => {
  return (
    <label className={styles.toggle}>
      <input
        type="checkbox"
        className={styles.toggleInput}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label="Тёмная тема"
      />
      <span className={styles.toggleTrack} aria-hidden>
        <span className={styles.toggleThumb} />
      </span>
    </label>
  );
};
