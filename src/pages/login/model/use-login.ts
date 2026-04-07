import { useLoginMutation } from "@/services/auth.api";
import type { TLoginFormDto } from "@/shared/model/schemas/auth.schema";
import { setToken } from "@/stores/auth.store";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mutate, { isLoading }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onHandleSubmit = async (data: TLoginFormDto) => {
    console.log("Login data:", data);

    try {
      const response = await mutate({
        email: data.email,
        password: data.password
      }).unwrap();

      console.log("Login response:", response);

      dispatch(setToken(response.accessToken));
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("email", data.email);
      navigate("/groups");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Login error:", err);
      if (err?.data?.message) {
        setErrorMessage(err.data.message);
      } else {
        setErrorMessage("Произошла ошибка при входе");
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
