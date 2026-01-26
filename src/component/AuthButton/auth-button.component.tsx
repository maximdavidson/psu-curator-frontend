import styles from "./auth-button.styles.module.scss";

interface IAuthButtonProps {
  isPending: boolean;
}

export const AuthButton = ({ isPending }: IAuthButtonProps) => {
  return (
    <button className={styles.submitButton}>
      {isPending ? "Отправка..." : "Зарегистрироваться"}
    </button>
  );
};
