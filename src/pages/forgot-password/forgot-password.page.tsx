import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthPageLayout } from "@/component/AuthPageLayout";
import { AuthFormLayout } from "@/component/AuthFormLayout";
import { AuthField } from "@/component/AuthField";
import { AuthButton } from "@/component/AuthButton";
import { AuthBackToLoginLink } from "@/component/AuthBackToLoginLink";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  recoverPasswordSchema,
  type TRecoverPasswordFormDto
} from "@/shared/model/schemas/auth.schema";
import { useRecoverPasswordMutation } from "@/services/auth.api";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";
import styles from "./forgot-password.module.scss";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [recoverPassword, { isLoading }] = useRecoverPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TRecoverPasswordFormDto>({
    resolver: yupResolver(recoverPasswordSchema)
  });

  const onSubmit = async (data: TRecoverPasswordFormDto) => {
    setErrorMessage(null);

    try {
      await recoverPassword({
        email: data.email.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        surname: data.surname?.trim() || undefined,
        courseNumber: data.courseNumber?.trim()
          ? Number(data.courseNumber)
          : undefined,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      }).unwrap();

      navigate("/login", {
        replace: true,
        state: {
          message: "Пароль успешно изменён. Войдите с новым паролем."
        }
      });
    } catch (error) {
      setErrorMessage(
        readApiErrorMessage(error) ??
          "Не удалось восстановить пароль. Проверьте введённые данные."
      );
    }
  };

  return (
    <AuthPageLayout>
      <AuthFormLayout
        onSubmit={handleSubmit(onSubmit)}
        footer={<AuthBackToLoginLink />}
        title="Восстановление пароля"
      >
        <p className={styles.description}>
          Укажите email и данные аккаунта для подтверждения личности, затем
          задайте новый пароль. Для студентов также нужен номер курса.
        </p>

        <AuthField<TRecoverPasswordFormDto>
          label="Почта"
          name="email"
          register={register}
          error={errors.email?.message || ""}
          placeholder="email"
          type="email"
        />
        <AuthField<TRecoverPasswordFormDto>
          label="Имя"
          name="firstName"
          register={register}
          error={errors.firstName?.message || ""}
          placeholder="Имя"
          type="text"
        />
        <AuthField<TRecoverPasswordFormDto>
          label="Фамилия"
          name="lastName"
          register={register}
          error={errors.lastName?.message || ""}
          placeholder="Фамилия"
          type="text"
        />
        <AuthField<TRecoverPasswordFormDto>
          label="Отчество"
          name="surname"
          register={register}
          error={errors.surname?.message || ""}
          placeholder="Отчество (если указано в профиле)"
          type="text"
        />

        <div className={styles.field}>
          <label className={styles.label} htmlFor="recover-course">
            Курс (для студентов)
          </label>
          <input
            id="recover-course"
            className={styles.input}
            type="text"
            inputMode="numeric"
            placeholder="1–6"
            {...register("courseNumber")}
          />
          {errors.courseNumber && (
            <p className={styles.error}>{errors.courseNumber.message}</p>
          )}
        </div>

        <AuthField<TRecoverPasswordFormDto>
          label="Новый пароль"
          name="newPassword"
          register={register}
          error={errors.newPassword?.message || ""}
          placeholder="Введите новый пароль"
          type="password"
        />
        <AuthField<TRecoverPasswordFormDto>
          label="Подтвердите пароль"
          name="confirmPassword"
          register={register}
          error={errors.confirmPassword?.message || ""}
          placeholder="Повторите пароль"
          type="password"
        />

        <AuthButton isLoading={isLoading} error={errorMessage}>
          Сохранить новый пароль
        </AuthButton>
      </AuthFormLayout>
    </AuthPageLayout>
  );
};
