import { AuthLayout } from "@/component/AuthLayout";
import { LoginForm } from "./form/login-form.component";

export const LoginationPage = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};
