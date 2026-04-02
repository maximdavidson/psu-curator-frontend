import { AuthField } from "@/component/AuthField/";
import { AuthFormLayout } from "@/component/AuthFormLayout/";
import { AuthButton } from "@/component/AuthButton/auth-button.component";
import { RegistrationFooter } from "./registration-footer.component";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  FIELDS_KEYS,
  FIELDS_LABELS,
  FIELDS_PLACEHOLDERS,
  FIELDS_TYPES
} from "@/shared/";
import {
  authSchema,
  type TAuthFormDto,
  UserRole,
  UserRoleLabels
} from "@/shared";
import { useRegister } from "../../model/use-register";
import styles from "./registration.styles.module.scss";

export const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TAuthFormDto>({
    resolver: yupResolver(authSchema),
    defaultValues: {
      role: UserRole.Student // Student = 1
    }
  });

  const { onHandleSubmit, isLoading, errorMessage } = useRegister();

  const roleOptions = [
    { value: UserRole.Student, label: UserRoleLabels[UserRole.Student] },
    { value: UserRole.Headman, label: UserRoleLabels[UserRole.Headman] },
    { value: UserRole.Curator, label: UserRoleLabels[UserRole.Curator] },
    { value: UserRole.Dean, label: UserRoleLabels[UserRole.Dean] },
    { value: UserRole.DeputyDean, label: UserRoleLabels[UserRole.DeputyDean] },
    { value: UserRole.Admin, label: UserRoleLabels[UserRole.Admin] }
  ];

  return (
    <AuthFormLayout
      onSubmit={handleSubmit(onHandleSubmit)}
      footer={<RegistrationFooter />}
      title={"Регистрация"}
    >
      {FIELDS_KEYS.map((key) => (
        <AuthField<TAuthFormDto>
          key={key}
          label={FIELDS_LABELS[key]}
          name={key}
          register={register}
          error={errors[key]?.message || ""}
          placeholder={FIELDS_PLACEHOLDERS[key]}
          type={FIELDS_TYPES[key]}
        />
      ))}

      <div className={styles.roleSelectWrapper}>
        <label className={styles.roleLabel}>Выберите роль:</label>
        <select
          {...register("role")}
          className={styles.roleSelect}
          disabled={isSubmitting}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.role?.message && (
          <span className={styles.roleError}>{errors.role.message}</span>
        )}
      </div>

      <AuthButton isLoading={isLoading} error={errorMessage}>
        Зарегистрироваться
      </AuthButton>
    </AuthFormLayout>
  );
};
