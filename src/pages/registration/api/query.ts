import { useMutation } from "@tanstack/react-query";
import { login } from "./service";
import type { TAuthDto } from "@/shared";
import type { SubmitHandler } from "react-hook-form";

export const useRegister = () => {
  const { mutate, ...props } = useMutation({
    mutationFn: login
  });

  const onSubmit: SubmitHandler<TAuthDto> = (data: TAuthDto) => {
    mutate(data);
  };

  return { onSubmit, ...props };
};
