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

const recoverPasswordBaseSchema = {
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
  newPassword: passwordFieldSchema.required("Новый пароль обязателен"),
  confirmPassword: yup
    .string()
    .required("Подтверждение пароля обязательно")
    .oneOf([yup.ref("newPassword")], "Пароли не совпадают")
};

export const recoverPasswordStudentSchema = yup.object({
  ...recoverPasswordBaseSchema,
  courseNumber: yup
    .string()
    .trim()
    .required("Укажите курс")
    .matches(/^[1-6]$/, "Курс должен быть от 1 до 6"),
  faculty: yup.string().trim().default("")
});

export const recoverPasswordStaffSchema = yup.object({
  ...recoverPasswordBaseSchema,
  faculty: yup
    .string()
    .trim()
    .max(200, "Название факультета слишком длинное")
    .default(""),
  courseNumber: yup.string().trim().default("")
});

/** @deprecated Используйте recoverPasswordStudentSchema или recoverPasswordStaffSchema */
export const recoverPasswordSchema = recoverPasswordStudentSchema;

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
export type TRecoverPasswordStudentFormDto = yup.InferType<
  typeof recoverPasswordStudentSchema
>;
export type TRecoverPasswordStaffFormDto = yup.InferType<
  typeof recoverPasswordStaffSchema
>;
export type TRecoverPasswordFormDto = TRecoverPasswordStudentFormDto;
export type TAuthFormDto = TRegisterFormDto;
