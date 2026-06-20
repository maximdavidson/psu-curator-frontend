import { Link } from "react-router-dom";
import { PAGE_ROUTES } from "@/shared/model/routes";
import styles from "./login.styles.module.scss";

export const ForgetPasswordLink = () => {
  return (
    <Link
      className={styles.forgotPassword}
      to={PAGE_ROUTES.PUBLIC.FORGOT_PASSWORD}
    >
      Вы забыли пароль?
    </Link>
  );
};
