import { useRegisterMutation } from "@/services/auth.api";
import { useState } from "react";
import type { TAuthFormDto } from "@/shared";
import { useDispatch } from "react-redux";
import { setToken } from "@/stores/auth.store";
import { useNavigate } from "react-router-dom";

export const useRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mutate, { isLoading, data: responseData }] = useRegisterMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onHandleSubmit = async (data: TAuthFormDto) => {
    try {
      const response = await mutate(data).unwrap();
      dispatch(setToken(response.accessToken));
      navigate("/groups");
    } catch {
      if (responseData) {
        setErrorMessage(responseData?.error);
        setTimeout(() => setErrorMessage(null), 3000);
      }
    }
  };

  return {
    onHandleSubmit,
    isLoading,
    errorMessage
  };
};
