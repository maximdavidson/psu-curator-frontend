import styles from "./placeholder.styles.module.scss";

interface PlaceholderProps {
  page: string;
}

export const Placeholder = ({ page }: PlaceholderProps) => {
  return (
    <div className={styles.placeholder}>
      <h1>Страница в разработке</h1>
      <p>Страница "{page}" пока недоступна.</p>
      <p>Скоро она будет готова!</p>
    </div>
  );
};
