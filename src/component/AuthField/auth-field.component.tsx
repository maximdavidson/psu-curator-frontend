import type { TAuthDto } from "@/shared";
import type { UseFormRegister } from "react-hook-form";
import styles from "./auth-field.styles.module.scss";
import type { ReactNode } from "react";

interface IProps {
  label: string;
  name: keyof TAuthDto;
  register: UseFormRegister<TAuthDto>;
  error: string;
  AdditionalLink?: ReactNode;
}

export const AuthField = ({
  name,
  register,
  error,
  label,
  AdditionalLink
}: IProps) => {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        {...register(name)}
        type={name === "email" ? "email" : "text"}
        className={styles.input}
      />
      {AdditionalLink}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
