import { FormComponent } from "../pages/registration/components/form/form.component";
import { LoginComponent } from "../pages/login/components/form/login.component";
import styles from "./bg.styles.module.scss";

export const RegistrationPage = () => {
  return (
    <div className={styles.registrationPage}>
      <FormComponent />
    </div>
  );
};

export const LoginationPage = () => {
  return (
    <div className={styles.registrationPage}>
      <LoginComponent />
    </div>
  );
};
