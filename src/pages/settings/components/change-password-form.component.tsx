import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthField } from "@/component/AuthField";
import {
  changePasswordSchema,
  type TChangePasswordFormDto
} from "@/shared/model/schemas/auth.schema";
import { useChangePasswordMutation } from "@/services/user.api";
import styles from "../settings.module.scss";

export const ChangePasswordForm = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TChangePasswordFormDto>({
    resolver: yupResolver(changePasswordSchema)
  });

  const onSubmit = async (data: TChangePasswordFormDto) => {
    setApiError("");
    setSuccessMessage("");

    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      }).unwrap();
      reset();
      setSuccessMessage("Пароль успешно изменён.");
    } catch (error) {
      const message =
        (error as { data?: { error?: string } })?.data?.error ??
        "Не удалось изменить пароль.";
      setApiError(message);
    }
  };

  return (
    <form
      className={styles.passwordForm}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <AuthField<TChangePasswordFormDto>
        label="Текущий пароль"
        name="currentPassword"
        register={register}
        error={errors.currentPassword?.message ?? ""}
        placeholder="текущий пароль"
        type="password"
      />
      <AuthField<TChangePasswordFormDto>
        label="Новый пароль"
        name="newPassword"
        register={register}
        error={errors.newPassword?.message ?? ""}
        placeholder="новый пароль"
        type="password"
      />
      <AuthField<TChangePasswordFormDto>
        label="Подтверждение пароля"
        name="confirmPassword"
        register={register}
        error={errors.confirmPassword?.message ?? ""}
        placeholder="повторите пароль"
        type="password"
      />

      {apiError && <p className={styles.passwordError}>{apiError}</p>}
      {successMessage && (
        <p className={styles.passwordSuccess}>{successMessage}</p>
      )}

      <button
        type="submit"
        className={styles.passwordSubmit}
        disabled={isLoading}
      >
        {isLoading ? "Сохранение..." : "Сменить пароль"}
      </button>
    </form>
  );
};
