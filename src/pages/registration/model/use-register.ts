import { useRegisterMutation } from "@/services/auth.api";
import { useState } from "react";
import type { TRegisterFormDto } from "@/shared"; // ← меняем импорт
import { useDispatch } from "react-redux";
import { setToken } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";

export const useRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mutate, { isLoading }] = useRegisterMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onHandleSubmit = async (data: TRegisterFormDto) => {
    // ← меняем тип
    try {
      const response = await mutate(data).unwrap();

      dispatch(setToken(response.accessToken));
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("email", data.email);

      console.log("Регистрация успешна, редирект на /groups");
      navigate("/groups");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err?.data?.message) {
        setErrorMessage(err.data.message);
      } else {
        setErrorMessage("Произошла ошибка при регистрации");
      }
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  return {
    onHandleSubmit,
    isLoading,
    errorMessage
  };
};
