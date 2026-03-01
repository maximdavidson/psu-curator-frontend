import { useLoginMutation } from "@/services/auth.api";
import type { TSigninFormDto } from "@/shared";

export const useLogin = () => {
  const [registerUser, { isLoading, isError }] = useLoginMutation();

  const onSubmit = (data: TSigninFormDto) => {
    registerUser(data);
  };

  return {
    onSubmit,
    isLoading,
    isError
  };
};
