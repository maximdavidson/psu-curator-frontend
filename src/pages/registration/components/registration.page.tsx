import { AuthPageLayout } from "@/component/AuthPageLayout";
import { RegistrationForm } from "./form/registration-form.component";
export const RegistrationPage = () => {
  return (
    <AuthPageLayout>
      <RegistrationForm />
    </AuthPageLayout>
  );
};
