import type { ReactNode } from "react";
import styles from "./auth-button.styles.module.scss";

interface IAuthButtonProps {
  children: ReactNode;
  isError?: boolean;
  isLoading: boolean;
}

export const AuthButton = ({ children, isLoading }: IAuthButtonProps) => {
  return (
    <button className={styles.submitButton}>
      {isLoading ? "Loading..." : children}
    </button>
  );
};
