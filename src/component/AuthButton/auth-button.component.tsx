import styles from "./auth-button.styles.module.scss";
import { getButtonContent } from "./helper";

export interface IAuthButtonProps {
  children: React.ReactNode;
  error?: string | null;
  isLoading: boolean;
}

export const AuthButton = ({
  children,
  isLoading,
  error
}: IAuthButtonProps) => {
  return (
    <button
      type="submit"
      className={`${styles.submitButton}`}
      disabled={Boolean(error)}
    >
      {getButtonContent({ isLoading, error, children })}
    </button>
  );
};
