import { Link } from "react-router-dom";
import styles from "./registration.styles.module.scss";

export const RegistrationFooter = () => {
  return (
    <div className={styles.footer}>
      <span>У вас есть аккаунт?</span>
      <Link className={styles.linker} to="/login">
        Войти
      </Link>
    </div>
  );
};
