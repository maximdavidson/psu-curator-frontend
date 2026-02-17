import { useAuthForm } from "@/hooks/use-auth-form";
import { AuthField } from "@/component/AuthField/";
import { AuthFormLayout } from "@/component/AuthFormLayout/";
import { AuthButton } from "@/component/AuthButton/auth-button.component";
import { RegistrationFooter } from "./registration-footer.component";
import { useRegister } from "../../api/query";

export const RegistrationForm = () => {
  const { register, handleSubmit, errors } = useAuthForm();

  const { onSubmit, isPending } = useRegister();

  return (
    <AuthFormLayout
      onSubmit={handleSubmit(onSubmit)}
      footer={<RegistrationFooter />}
      title={"Регистрация"}
    >
      <AuthField
        label={"Почта"}
        name={"email"}
        register={register}
        error={errors.email?.message || ""}
        placeholder={"email"}
      />
      <AuthField
        label={"Пароль"}
        name={"password"}
        register={register}
        error={errors.password?.message || ""}
        placeholder={"пароль"}
      />
      <AuthButton isPending={isPending} isLogin={false} />
    </AuthFormLayout>
  );
};
