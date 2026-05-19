import { AuthPageLayout } from "@/component/AuthPageLayout";
import { LoginForm } from "./form/login-form.component";
export const LoginationPage = () => {
  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
};
