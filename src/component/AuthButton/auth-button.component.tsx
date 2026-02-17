import styles from "./auth-button.styles.module.scss";

interface IAuthButtonProps {
  isPending: boolean;
  isLogin: boolean;
}

export const AuthButton = ({ isPending, isLogin }: IAuthButtonProps) => {
  return (
    <button className={styles.submitButton}>
      {isPending ? "Отправка..." : isLogin ? "Войти" : "Зарегистрироваться"}
    </button>
  );
};
