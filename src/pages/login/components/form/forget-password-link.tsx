import { Link } from "react-router-dom";

import styles from "./login.styles.module.scss";

export const ForgetPasswordLink = () => {
  return (
    <Link className={styles.forgotPassword} to="/forget-password">
      Вы забыли пароль?
    </Link>
  );
};
