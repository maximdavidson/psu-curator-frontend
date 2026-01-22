import { AuthFormLayout } from "@/component/AuthFormLayout";
import { AuthField } from "@/component/AuthField";
import { useAuthForm } from "@/hooks/use-auth-form";
import { AuthButton } from "@/component/AuthButton";
import { LoginFooter } from "./login-footer.component";
import { useLogin } from "../../api/query";
import { ForgetPasswordLink } from "./forget-password-link";

export const LoginForm = () => {
  const { register, handleSubmit, errors } = useAuthForm();

  const { onSubmit, isError, isPending } = useLogin();

  return (
    <AuthFormLayout
      onSubmit={handleSubmit(onSubmit)}
      footer={<LoginFooter />}
      title={"Вход"}
    >
      <AuthField
        label={"Почта"}
        name={"email"}
        register={register}
        error={errors.email?.message || ""}
      />
      <AuthField
        AdditionalLink={<ForgetPasswordLink />}
        label={"Пароль"}
        name={"password"}
        register={register}
        error={errors.password?.message || ""}
      />
      <AuthButton isPending={isPending} isError={isError} />
    </AuthFormLayout>
  );
};
