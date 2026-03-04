import { useLoginMutation } from "@/services/auth.api";
import type { TAuthFormDto } from "@/shared";
import { setToken } from "@/stores/auth.store";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export const useRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mutate, { isLoading, data: responseData }] = useLoginMutation();
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
