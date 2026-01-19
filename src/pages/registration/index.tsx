import { FormComponent } from "./components/form/form.component";
import { LoginComponent } from "./components/form/login.componet";
import styles from "./styles.module.scss";

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
