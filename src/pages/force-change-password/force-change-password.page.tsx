import { AuthPageLayout } from "@/component/AuthPageLayout";
import { AuthFormLayout } from "@/component/AuthFormLayout";
import { AuthField } from "@/component/AuthField";
import { AuthButton } from "@/component/AuthButton";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForceChangePasswordMutation } from "@/services/user.api";
import { clearMustChangePassword } from "@/stores/auth.store";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";

const schema = yup
  .object({
    newPassword: yup
      .string()
      .min(8, "Пароль должен быть не менее 8 символов")
      .matches(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Пароль должен содержать хотя бы один спецсимвол"
      )
      .required("Новый пароль обязателен"),
    confirmPassword: yup
      .string()
      .required("Подтверждение пароля обязательно")
      .oneOf([yup.ref("newPassword")], "Пароли не совпадают")
  })
  .required();

type FormData = yup.InferType<typeof schema>;

export const ForceChangePasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mutate, { isLoading }] = useForceChangePasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    setErrorMessage(null);
    try {
      await mutate({ newPassword: data.newPassword }).unwrap();
      dispatch(clearMustChangePassword());
      navigate("/groups");
    } catch (err: unknown) {
      const message = readApiErrorMessage(err);
      setErrorMessage(message ?? "Не удалось сменить пароль");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <AuthPageLayout>
      <AuthFormLayout
        onSubmit={handleSubmit(onSubmit)}
        footer={
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              opacity: 0.7,
              marginTop: 12
            }}
          >
            Вы вошли с временным паролем. Создайте собственный пароль для
            продолжения работы.
          </p>
        }
        title="Создайте новый пароль"
      >
        <AuthField<FormData>
          label="Новый пароль"
          name="newPassword"
          register={register}
          error={errors.newPassword?.message || ""}
          placeholder="Введите новый пароль"
          type="password"
        />
        <AuthField<FormData>
          label="Подтвердите пароль"
          name="confirmPassword"
          register={register}
          error={errors.confirmPassword?.message || ""}
          placeholder="Повторите пароль"
          type="password"
        />
        <AuthButton isLoading={isLoading} error={errorMessage}>
          Сохранить пароль
        </AuthButton>
      </AuthFormLayout>
    </AuthPageLayout>
  );
};
