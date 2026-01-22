import type { ReactNode } from "react";
import styles from "./auth-page-layout.styles.module.scss";

interface IProps {
  children: ReactNode;
}

export const AuthPageLayout = ({ children }: IProps) => {
  return <div className={styles.authLayout}>{children}</div>;
};
