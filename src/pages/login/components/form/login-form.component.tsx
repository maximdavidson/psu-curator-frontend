import { AuthFormLayout } from "@/component/AuthFormLayout";
import { AuthField } from "@/component/AuthField";
import { AuthButton } from "@/component/AuthButton";
import { LoginFooter } from "./login-footer.component";
import { ForgetPasswordLink } from "./forget-password-link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLoginMutation } from "@/services/auth.api";
import { authSchema, type TAuthFormDto } from "@/shared";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TAuthFormDto>({
    resolver: yupResolver(authSchema)
  });

  const [mutate, { isLoading, data: responseData }] = useLoginMutation();

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
