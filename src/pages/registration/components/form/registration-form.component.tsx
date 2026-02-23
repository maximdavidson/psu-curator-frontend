import { AuthField } from "@/component/AuthField/";
import { AuthFormLayout } from "@/component/AuthFormLayout/";
import { AuthButton } from "@/component/AuthButton/auth-button.component";
import { RegistrationFooter } from "./registration-footer.component";
import { useRegister } from "../../api/query";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupFormSchema, type TSignupFormDto } from "@/shared";
import { useForm } from "react-hook-form";

export const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TSignupFormDto>({
    resolver: yupResolver(signupFormSchema)
  });

  const { onSubmit, isPending } = useRegister();

  return (
    <AuthFormLayout
      onSubmit={handleSubmit(onSubmit)}
      footer={<RegistrationFooter />}
      title={"Регистрация"}
    >
      <AuthField<TSignupFormDto>
        label={"Почта"}
        name={"email"}
        register={register}
        error={errors.email?.message || ""}
        placeholder={"email"}
      />
      <AuthField<TSignupFormDto>
        label={"Пароль"}
        name={"password"}
        register={register}
        error={errors.password?.message || ""}
        placeholder={"пароль"}
      />
      <AuthButton isLoading={isPending}>Зарегистрироваться</AuthButton>
    </AuthFormLayout>
  );
};
