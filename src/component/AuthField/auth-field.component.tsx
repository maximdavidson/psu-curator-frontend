import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import styles from "./auth-field.styles.module.scss";
import { useState, type ReactNode } from "react";
import type { InputType } from "@/shared/";
import EyesOpen from "@/assets/eyes-open.svg";
import EyesClosed from "@/assets/eyes-closed.svg";

interface IAuthFieldProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error: string;
  additionalLink?: ReactNode;
  placeholder: string;
  type: InputType;
}

export const AuthField = <T extends FieldValues>({
  name,
  register,
  error,
  label,
  additionalLink,
  placeholder,
  type
}: IAuthFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className={styles.label}>{label}</label>
      <div className={styles.field__inner}>
        <input
          placeholder={placeholder}
          {...register(name)}
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          className={styles.input}
        />
        {type === "password" && (
          <button
            className={styles.button__eyes}
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            <img src={showPassword ? EyesOpen : EyesClosed} alt="eyes" />
          </button>
        )}
      </div>
      {additionalLink}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
