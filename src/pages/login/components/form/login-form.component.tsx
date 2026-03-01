import { AuthFormLayout } from "@/component/AuthFormLayout";
import { AuthField } from "@/component/AuthField";
import { AuthButton } from "@/component/AuthButton";
import { LoginFooter } from "./login-footer.component";
import { ForgetPasswordLink } from "./forget-password-link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signinSchema, type TSigninFormDto } from "@/shared";
import { useLoginMutation } from "@/services/auth.api";

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TSigninFormDto>({
    resolver: yupResolver(signinSchema)
  });

  const [mutate, { isLoading }] = useLoginMutation();

  return (
    <AuthFormLayout
      onSubmit={handleSubmit(mutate)}
      footer={<LoginFooter />}
      title={"Вход"}
    >
      <AuthField<TSigninFormDto>
        label={"Почта"}
        name={"email"}
        register={register}
        error={errors.email?.message || ""}
        placeholder={"email"}
      />
      <AuthField<TSigninFormDto>
        additionalLink={<ForgetPasswordLink />}
        label={"Пароль"}
        name={"password"}
        register={register}
        error={errors.password?.message || ""}
        placeholder={"пароль"}
      />
      <AuthButton isLoading={isLoading}>Войти</AuthButton>
    </AuthFormLayout>
  );
};
