import { useLoginMutation } from "@/services/auth.api";
import type { TLoginFormDto } from "@/shared/model/schemas/auth.schema";
import { setTokens } from "@/stores/auth.store";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";
export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mutate, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onHandleSubmit = async (data: TLoginFormDto) => {
    try {
      const response = await mutate({
        email: data.email,
        password: data.password
      }).unwrap();
      dispatch(setTokens(response));
      localStorage.setItem("email", data.email);
      navigate("/groups");
    } catch (err: unknown) {
      console.error("Login error:", err);
      const message = readApiErrorMessage(err);
      setErrorMessage(message ?? "Произошла ошибка при входе");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };
  return {
    onHandleSubmit,
    isLoading,
    errorMessage
  };
};
