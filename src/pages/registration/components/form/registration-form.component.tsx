import { AuthField } from "@/component/AuthField/";
import { AuthFormLayout } from "@/component/AuthFormLayout/";
import { AuthButton } from "@/component/AuthButton/auth-button.component";
import { RegistrationFooter } from "./registration-footer.component";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupFormSchema, type TSignupFormDto } from "@/shared";
import { useForm } from "react-hook-form";
import { useRegisterMutation } from "@/services/auth.api";
import {
  FIELDS_KEYS,
  FIELDS_LABELS,
  FIELDS_PLACEHOLDERS
} from "../../model/constants";
import { useEffect } from "react";

export const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TSignupFormDto>({
    resolver: yupResolver(signupFormSchema)
  });

  const [mutate, { isLoading, error }] = useRegisterMutation();

  const onSubmit = (dto: TSignupFormDto) => {
    mutate({ ...dto, role: 1 });
  };

  useEffect(() => {
    console.log(error);
  }, [error]);

  return (
    <AuthFormLayout
      onSubmit={handleSubmit(onSubmit)}
      footer={<RegistrationFooter />}
      title={"Регистрация"}
    >
      {FIELDS_KEYS.map((key) => (
        <AuthField<TSignupFormDto>
          key={key}
          label={FIELDS_LABELS[key]}
          name={key}
          register={register}
          error={errors[key]?.message || ""}
          placeholder={FIELDS_PLACEHOLDERS[key]}
        />
      ))}
      <AuthButton isLoading={isLoading}>Зарегистрироваться</AuthButton>
    </AuthFormLayout>
  );
};
