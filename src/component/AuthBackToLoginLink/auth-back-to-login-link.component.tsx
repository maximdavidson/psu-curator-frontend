import { Link } from "react-router-dom";
import styles from "@/component/AuthFormLayout/auth-form-layout.module.scss";

export const AuthBackToLoginLink = () => (
  <div className={styles.footer}>
    <Link className={styles.linker} to="/login">
      Вернуться ко входу
    </Link>
  </div>
);
