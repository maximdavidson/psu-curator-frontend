import styles from "./auth-button.styles.module.scss";

interface IProps {
  isPending: boolean;
  isError: boolean;
}

export const AuthButton = ({ isPending }: IProps) => {
  return (
    <button className={styles.submitButton}>
      {isPending ? "Отправка..." : "Зарегистрироваться"}
    </button>
  );
};
