import type { IAuthButtonProps } from "./auth-button.component";

export const getButtonContent = ({
  isLoading,
  error,
  children
}: IAuthButtonProps) => {
  if (isLoading) return "Загрузка...";
  if (error) return error;
  return children;
};
