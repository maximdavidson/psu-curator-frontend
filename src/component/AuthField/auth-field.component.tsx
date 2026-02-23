import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import styles from "./auth-field.styles.module.scss";
import type { ReactNode } from "react";

interface IAuthFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error: string;
  additionalLink?: ReactNode;
  placeholder: string;
}

export const AuthField = <T extends FieldValues>({
  name,
  register,
  error,
  label,
  additionalLink,
  placeholder
}: IAuthFieldProps<T>) => {
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
