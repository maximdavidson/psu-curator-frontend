import * as yup from "yup";
export const loginSchema = yup.object({
  email: yup
    .string()
    .email("введите корректный email")
    .required("Электронная почта обязательна"),
  password: yup
    .string()
    .min(8, "Пароль должен быть не менее 8 символов")
    .matches(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Пароль должен содержать хотя бы один спецсимвол"
    )
    .required("Пароль обязателен")
});
const studentEmailSchema = yup
  .string()
  .email("введите корректный email")
  .required("Электронная почта обязательна")
  .matches(
    /@students\.psu\.by$/i,
    "Укажите корпоративную почту @students.psu.by"
  );

export const registerSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .max(50, "Имя не может быть длиннее 50 символов")
    .required("Имя обязательно"),
  lastName: yup
    .string()
    .trim()
    .max(50, "Фамилия не может быть длиннее 50 символов")
    .required("Фамилия обязательна"),
  email: studentEmailSchema,
  password: yup
    .string()
    .min(8, "Пароль должен быть не менее 8 символов")
    .matches(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Пароль должен содержать хотя бы один спецсимвол"
    )
    .required("Пароль обязателен")
});
export const authSchema = registerSchema;
const passwordFieldSchema = yup
  .string()
  .min(8, "Пароль должен быть не менее 8 символов")
  .matches(/[A-Z]/, "Пароль должен содержать хотя бы одну заглавную букву")
  .matches(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Пароль должен содержать хотя бы один спецсимвол"
  );

export const recoverPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Введите корректный email")
    .required("Электронная почта обязательна"),
  firstName: yup
    .string()
    .trim()
    .max(50, "Имя не может быть длиннее 50 символов")
    .required("Укажите имя"),
  lastName: yup
    .string()
    .trim()
    .max(50, "Фамилия не может быть длиннее 50 символов")
    .required("Укажите фамилию"),
  surname: yup
    .string()
    .trim()
    .max(50, "Отчество не может быть длиннее 50 символов")
    .default(""),
  courseNumber: yup
    .string()
    .trim()
    .test(
      "course-range",
      "Курс должен быть от 1 до 6",
      (value) => !value || /^[1-6]$/.test(value)
    )
    .default(""),
  newPassword: passwordFieldSchema.required("Новый пароль обязателен"),
  confirmPassword: yup
    .string()
    .required("Подтверждение пароля обязательно")
    .oneOf([yup.ref("newPassword")], "Пароли не совпадают")
});

export const changePasswordSchema = yup
  .object({
    currentPassword: yup.string().required("Текущий пароль обязателен"),
    newPassword: passwordFieldSchema.required("Новый пароль обязателен"),
    confirmPassword: yup
      .string()
      .required("Подтверждение пароля обязательно")
      .oneOf([yup.ref("newPassword")], "Пароли не совпадают")
  })
  .required();

export type TLoginFormDto = yup.InferType<typeof loginSchema>;
export type TRegisterFormDto = yup.InferType<typeof registerSchema>;
export type TChangePasswordFormDto = yup.InferType<typeof changePasswordSchema>;
export type TRecoverPasswordFormDto = yup.InferType<
  typeof recoverPasswordSchema
>;
export type TAuthFormDto = TRegisterFormDto;
