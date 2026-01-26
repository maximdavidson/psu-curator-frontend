import type { TAuthDto } from "@/shared";
import type { UseFormRegister } from "react-hook-form";
import styles from "./auth-field.styles.module.scss";
import type { ReactNode } from "react";

interface IAuthFieldProps {
  label: string;
  name: keyof TAuthDto;
  register: UseFormRegister<TAuthDto>;
  error: string;
  additionalLink?: ReactNode;
  placeholder: string;
}

export const AuthField = ({
  name,
  register,
  error,
  label,
  additionalLink,
  placeholder
}: IAuthFieldProps) => {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input
        placeholder={placeholder}
        {...register(name)}
        type={name === "email" ? "email" : "text"}
        className={styles.input}
      />
      {additionalLink}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
