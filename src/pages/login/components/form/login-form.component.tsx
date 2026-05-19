import { AuthFormLayout } from "@/component/AuthFormLayout";
import { AuthField } from "@/component/AuthField";
import { AuthButton } from "@/component/AuthButton";
import { LoginFooter } from "./login-footer.component";
import { ForgetPasswordLink } from "./forget-password-link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLogin } from "../../model/use-login";
import {
  loginSchema,
  type TLoginFormDto
} from "@/shared/model/schemas/auth.schema";
export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TLoginFormDto>({
    resolver: yupResolver(loginSchema)
  });
  const { onHandleSubmit, isLoading, errorMessage } = useLogin();
  const onSubmit = (data: TLoginFormDto) => {
    console.log("Form submitted:", data);
    onHandleSubmit(data);
  };
  return (
    <AuthFormLayout
      onSubmit={handleSubmit(onSubmit)}
      footer={<LoginFooter />}
      title={"Вход"}
    >
      <AuthField<TLoginFormDto>
        label={"Почта"}
        name={"email"}
        register={register}
        error={errors.email?.message || ""}
        placeholder={"email"}
        type={"email"}
      />
      <AuthField<TLoginFormDto>
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
