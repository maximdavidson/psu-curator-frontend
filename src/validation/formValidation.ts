import * as yup from "yup";

export const registrationSchema = yup.object({
  email: yup.string().email("Некорректный email").required("Email обязателен"),
  password: yup
    .string()
    .min(6, "Пароль должен быть минимум 6 символов")
    .required("Пароль обязателен")
});
