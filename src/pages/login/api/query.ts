import { useMutation } from "@tanstack/react-query";
import { login } from "./service";
import type { SubmitHandler } from "react-hook-form";
import type { TAuthDto } from "@/shared";

export const useLogin = () => {
  const { mutate, ...props } = useMutation({
    mutationFn: login
  });
  const onSubmit: SubmitHandler<TAuthDto> = (data: TAuthDto) => {
    mutate(data);
  };

  return { onSubmit, ...props };
};
