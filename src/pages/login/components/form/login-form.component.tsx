import { AuthFormLayout } from "@/component/AuthFormLayout";
import { AuthField } from "@/component/AuthField";
import { AuthButton } from "@/component/AuthButton";
import { LoginFooter } from "./login-footer.component";
import { ForgetPasswordLink } from "./forget-password-link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocation } from "react-router-dom";
import { useLogin } from "../../model/use-login";
import {
  loginSchema,
  type TLoginFormDto
} from "@/shared/model/schemas/auth.schema";
import styles from "./login.styles.module.scss";

export const LoginForm = () => {
  const location = useLocation();
  const recoveryMessage = (location.state as { message?: string } | null)
    ?.message;
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
      {recoveryMessage && (
        <p className={styles.success} role="status">
          {recoveryMessage}
        </p>
      )}
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
