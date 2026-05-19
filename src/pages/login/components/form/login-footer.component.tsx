import { Link } from "react-router-dom";
import styles from "./login.styles.module.scss";
export const LoginFooter = () => {
  return (
    <div className={styles.footer}>
      <span>У вас нету аккаунта?</span>
      <Link className={styles.linker} to="/register">
        Зарегистрироваться
      </Link>
    </div>
  );
};
