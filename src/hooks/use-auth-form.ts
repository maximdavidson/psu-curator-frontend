import { authSchema, type TAuthDto } from "@/shared";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";

export const useAuthForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TAuthDto>({
    resolver: yupResolver(authSchema)
  });

  return {
    register,
    handleSubmit,
    errors
  };
};
