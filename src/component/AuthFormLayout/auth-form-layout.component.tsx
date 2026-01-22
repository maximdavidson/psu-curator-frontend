import type { BaseSyntheticEvent, ReactNode } from "react";
import styles from "./auth-form-layout.module.scss";

interface IProps {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  onSubmit: (e?: BaseSyntheticEvent<object> | undefined) => Promise<void>;
}

export const AuthFormLayout = ({
  title,
  children,
  footer,
  onSubmit
}: IProps) => {
  return (
    <div className={styles.formWrapper}>
      <h1 className={styles.title}>{title}</h1>
      <form onSubmit={onSubmit} className={styles.form}>
        {children}
      </form>
      {footer}
    </div>
  );
};
