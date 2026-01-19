import { Link } from "react-router-dom";
import { useState, type ChangeEvent } from "react";
import styles from "./styles.module.scss";
import { registrationSchema } from "../../../../validation/formValidation";
import { ValidationError } from "yup";

export const FormComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});

  const isDisabled =
    isSubmitting || !email || !password || !!error.email || !!error.password;

  const validateField = async (field: "email" | "password", value: string) => {
    try {
      await registrationSchema.pick([field]).validate({ [field]: value });
      setError((prev) => ({ ...prev, [field]: "" }));
    } catch (err) {
      if (err instanceof ValidationError) {
        setError((prev) => ({ ...prev, [field]: err.message }));
      }
    }
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
    validateField("email", value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
    validateField("password", value);
  };

  const handleSubmit = async () => {
    if (!email || !password || error.email || error.password) return;

    setIsSubmitting(true);
    try {
      console.log("Отправка данных:", { email, password });
      // ToDo
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {};

  return (
    <div className={styles.formWrapper}>
      <h1 className={styles.title}>Зарегистрироваться</h1>

      <form className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Почта</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className={styles.input}
          />
          <div className={styles.error}>{error.email || ""}</div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className={styles.input}
          />
          <div className={styles.error}>{error.password || ""}</div>
          <a className={styles.forgotPassword}>Забыли пароль?</a>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className={styles.submitButton}
          disabled={isDisabled}
        >
          {isSubmitting ? "Отправка..." : "Зарегистрироваться"}
        </button>
      </form>

      <div className={styles.footer}>
        <span>У вас есть аккаунт?</span>
        <button
          type="button"
          onClick={handleLoginRedirect}
          className={styles.link}
        >
          <Link className={styles.linker} to="/login">
            Войти
          </Link>
        </button>
      </div>
    </div>
  );
};
