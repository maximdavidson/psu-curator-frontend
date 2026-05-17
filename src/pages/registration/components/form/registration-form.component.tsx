import { AuthField } from "@/component/AuthField/";
import { AuthFormLayout } from "@/component/AuthFormLayout/";
import { AuthButton } from "@/component/AuthButton/auth-button.component";
import { RegistrationFooter } from "./registration-footer.component";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  FIELDS_KEYS,
  FIELDS_LABELS,
  FIELDS_PLACEHOLDERS,
  FIELDS_TYPES
} from "@/shared/";
import { authSchema, type TAuthFormDto } from "@/shared";
import { useRegister } from "../../model/use-register";

export const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TAuthFormDto>({
    resolver: yupResolver(authSchema)
  });

  const { onHandleSubmit, isLoading, errorMessage } = useRegister();

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
          type={FIELDS_TYPES[key]}
        />
      ))}

      <AuthButton isLoading={isLoading} error={errorMessage}>
        Зарегистрироваться
      </AuthButton>
    </AuthFormLayout>
  );
};
