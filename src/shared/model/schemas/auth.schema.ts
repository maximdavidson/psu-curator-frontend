import * as yup from "yup";

// Схема для логина (без role)
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

// Схема для регистрации (только email, password, role)
export const registerSchema = yup.object({
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
    .required("Пароль обязателен"),
  role: yup
    .number()
    .min(1, "Роль должна быть от 1 до 7")
    .max(7, "Роль должна быть от 1 до 7")
    .required("Роль обязательна")
});

// Оставляем для обратной совместимости
export const authSchema = registerSchema;

export type TLoginFormDto = yup.InferType<typeof loginSchema>;
export type TRegisterFormDto = yup.InferType<typeof registerSchema>;
export type TAuthFormDto = TRegisterFormDto;
