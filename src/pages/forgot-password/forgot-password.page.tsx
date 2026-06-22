import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthPageLayout } from "@/component/AuthPageLayout";
import { AuthFormLayout } from "@/component/AuthFormLayout";
import { AuthField } from "@/component/AuthField";
import { AuthButton } from "@/component/AuthButton";
import { AuthBackToLoginLink } from "@/component/AuthBackToLoginLink";
import { FacultyPicker } from "@/shared/ui/faculty-picker/faculty-picker";
import {
  recoverPasswordStaffSchema,
  recoverPasswordStudentSchema,
  type TRecoverPasswordStaffFormDto,
  type TRecoverPasswordStudentFormDto
} from "@/shared/model/schemas/auth.schema";
import { useRecoverPasswordMutation } from "@/services/auth.api";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";
import styles from "./forgot-password.module.scss";

type AccountKind = "student" | "staff";

const defaultStudentValues: TRecoverPasswordStudentFormDto = {
  email: "",
  firstName: "",
  lastName: "",
  surname: "",
  courseNumber: "",
  faculty: "",
  newPassword: "",
  confirmPassword: ""
};

const defaultStaffValues: TRecoverPasswordStaffFormDto = {
  email: "",
  firstName: "",
  lastName: "",
  surname: "",
  faculty: "",
  courseNumber: "",
  newPassword: "",
  confirmPassword: ""
};

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [recoverPassword, { isLoading }] = useRecoverPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountKind, setAccountKind] = useState<AccountKind>("student");

  const studentForm = useForm<TRecoverPasswordStudentFormDto>({
    resolver: yupResolver(recoverPasswordStudentSchema),
    defaultValues: defaultStudentValues
  });

  const staffForm = useForm<TRecoverPasswordStaffFormDto>({
    resolver: yupResolver(recoverPasswordStaffSchema),
    defaultValues: defaultStaffValues
  });

  const activeForm = accountKind === "student" ? studentForm : staffForm;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = activeForm;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrorMessage(null);
    reset(
      accountKind === "student" ? defaultStudentValues : defaultStaffValues
    );
  }, [accountKind, reset]);

  const onSubmit = async (
    data: TRecoverPasswordStudentFormDto | TRecoverPasswordStaffFormDto
  ) => {
    setErrorMessage(null);

    try {
      await recoverPassword({
        email: data.email.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        surname: data.surname?.trim() || undefined,
        courseNumber:
          accountKind === "student" && data.courseNumber?.trim()
            ? Number(data.courseNumber)
            : undefined,
        faculty:
          accountKind === "staff" && data.faculty?.trim()
            ? data.faculty.trim()
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
        titl
        e="Восстановление пароля"
      >
        <div
          className={styles.accountTabs}
          role="tablist"
          aria-label="Тип аккаунта"
        >
          <button
            type="button"
            role="tab"
            aria-selected={accountKind === "student"}
            className={
              accountKind === "student"
                ? styles.accountTabActive
                : styles.accountTab
            }
            onClick={() => setAccountKind("student")}
          >
            Студент
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={accountKind === "staff"}
            className={
              accountKind === "staff"
                ? styles.accountTabActive
                : styles.accountTab
            }
            onClick={() => setAccountKind("staff")}
          >
            Сотрудник
          </button>
        </div>

        <p className={styles.description}>
          {accountKind === "student"
            ? "Укажите корпоративную почту @students.psu.by, ФИО и номер курса, затем задайте новый пароль."
            : "Укажите рабочую почту, ФИО и факультет (для кураторов и деканата). Администратору факультет указывать не нужно."}
        </p>

        <AuthField
          label="Почта"
          name="email"
          register={register}
          error={errors.email?.message || ""}
          placeholder={
            accountKind === "student"
              ? "ivanov@students.psu.by"
              : "teacher@psu.ru"
          }
          type="email"
        />
        <AuthField
          label="Имя"
          name="firstName"
          register={register}
          error={errors.firstName?.message || ""}
          placeholder="Имя"
          type="text"
        />
        <AuthField
          label="Фамилия"
          name="lastName"
          register={register}
          error={errors.lastName?.message || ""}
          placeholder="Фамилия"
          type="text"
        />
        <AuthField
          label="Отчество"
          name="surname"
          register={register}
          error={errors.surname?.message || ""}
          placeholder="Отчество (если указано в профиле)"
          type="text"
        />

        {accountKind === "student" ? (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="recover-course">
              Курс
            </label>
            <input
              id="recover-course"
              className={styles.input}
              type="text"
              inputMode="numeric"
              placeholder="1–6"
              {...register("courseNumber")}
            />
            {"courseNumber" in errors && errors.courseNumber && (
              <p className={styles.error}>{errors.courseNumber.message}</p>
            )}
          </div>
        ) : (
          <div className={styles.field}>
            <Controller
              name="faculty"
              control={control}
              render={({ field }) => (
                <FacultyPicker
                  id="recover-faculty"
                  label="Факультет"
                  value={field.value ?? ""}
                  placeholder="Выберите факультет"
                  hint="Для администратора можно оставить пустым"
                  error={
                    "faculty" in errors ? errors.faculty?.message : undefined
                  }
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        )}

        <AuthField
          label="Новый пароль"
          name="newPassword"
          register={register}
          error={errors.newPassword?.message || ""}
          placeholder="Введите новый пароль"
          type="password"
        />
        <AuthField
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
