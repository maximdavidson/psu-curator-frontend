import { useRegisterMutation } from "@/services/auth.api";
import { useState } from "react";
import type { TRegisterFormDto } from "@/shared";
import { useDispatch } from "react-redux";
import { setTokens } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";
export const useRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mutate, { isLoading }] = useRegisterMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onHandleSubmit = async (data: TRegisterFormDto) => {
    try {
      const response = await mutate(data).unwrap();
      dispatch(setTokens(response));
      localStorage.setItem("email", data.email);
      navigate("/groups");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const message = readApiErrorMessage(err);
      setErrorMessage(message ?? "Произошла ошибка при регистрации");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };
  return {
    onHandleSubmit,
    isLoading,
    errorMessage
  };
};
