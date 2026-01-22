import { AuthLayout } from "@/component/AuthLayout";
import { RegistrationForm } from "./form/registration-form.component";

export const RegistrationPage = () => {
  return (
    <AuthLayout>
      <RegistrationForm />
    </AuthLayout>
  );
};
