import type { ReactNode } from "react";
import styles from "./auth-layout.styles.module.scss";

interface IProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: IProps) => {
  return <div className={styles.authLayout}>{children}</div>;
};
