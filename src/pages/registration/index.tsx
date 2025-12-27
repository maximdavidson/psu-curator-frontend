import { FormComponent } from "./components/form/form.component";
import styles from "./styles.module.scss";

export const RegistrationPage = () => {
  return (
    <div className={styles.registrationPage}>
      <FormComponent />
    </div>
  );
};
