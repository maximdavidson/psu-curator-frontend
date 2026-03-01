import { useRegisterMutation } from "@/services/auth.api";
import type { TSignupFormDto } from "@/shared";

export const useRegister = () => {
  const [registerUser, { isLoading, isError }] = useRegisterMutation();

  const onSubmit = (data: TSignupFormDto) => {
    registerUser(data);
  };

  return {
    onSubmit,
    isLoading,
    isError
  };
};
