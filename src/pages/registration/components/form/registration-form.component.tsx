import { AuthField } from "@/component/AuthField/";
import { AuthFormLayout } from "@/component/AuthFormLayout/";
import { AuthButton } from "@/component/AuthButton/auth-button.component";
import { RegistrationFooter } from "./registration-footer.component";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "@/services/auth.api";
import {
  FIELDS_KEYS,
  FIELDS_LABELS,
  FIELDS_PLACEHOLDERS
} from "../../model/constants";
import { authSchema, type TAuthFormDto } from "@/shared";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const RegistrationForm = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TAuthFormDto>({
    resolver: yupResolver(authSchema)
  });

  const [mutate, { isLoading, data: responseData }] = useRegisterMutation();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onHandleSubmit = async (data: TAuthFormDto) => {
    try {
      await mutate(data).unwrap();
      navigate("/groups");
    } catch (e) {
      if (responseData) {
        console.log(e);
        setErrorMessage(responseData?.error);
        setTimeout(() => setErrorMessage(null), 3000);
      }
    }
  };

  return (
    <AuthFormLayout
      onSubmit={handleSubmit(onHandleSubmit)}
      footer={<RegistrationFooter />}
      title={"Регистрация"}
    >
      {FIELDS_KEYS.map((key) => (
        <AuthField<TAuthFormDto>
          key={key}
          label={FIELDS_LABELS[key]}
          name={key}
          register={register}
          error={errors[key]?.message || ""}
          placeholder={FIELDS_PLACEHOLDERS[key]}
        />
      ))}
      <AuthButton isLoading={isLoading} error={errorMessage}>
        {"Зарегистрироваться"}
      </AuthButton>
    </AuthFormLayout>
  );
};
