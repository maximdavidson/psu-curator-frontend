import { AuthFormLayout } from "@/component/AuthFormLayout";
import { AuthField } from "@/component/AuthField";
import { AuthButton } from "@/component/AuthButton";
import { LoginFooter } from "./login-footer.component";
import { ForgetPasswordLink } from "./forget-password-link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { authSchema, type TAuthFormDto } from "@/shared";
import { useLogin } from "../../model/use-login";

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TAuthFormDto>({
    resolver: yupResolver(authSchema)
  });

  const { onHandleSubmit, isLoading, errorMessage } = useLogin();

  return (
    <AuthFormLayout
      onSubmit={handleSubmit(onHandleSubmit)}
      footer={<LoginFooter />}
      title={"Вход"}
    >
      <AuthField<TAuthFormDto>
        label={"Почта"}
        name={"email"}
        register={register}
        error={errors.email?.message || ""}
        placeholder={"email"}
        type={"email"}
      />
      <AuthField<TAuthFormDto>
        additionalLink={<ForgetPasswordLink />}
        label={"Пароль"}
        name={"password"}
        register={register}
        error={errors.password?.message || ""}
        placeholder={"пароль"}
        type={"password"}
      />
      <AuthButton isLoading={isLoading} error={errorMessage}>
        Войти
      </AuthButton>
    </AuthFormLayout>
  );
};
