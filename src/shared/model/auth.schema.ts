import * as yup from "yup";

export const authSchema = yup.object({
  email: yup
    .string()
    .email("введите корректный email")
    .required("Электронная почта обязательна"),
  password: yup.string().min(8).required("Пароль обязателен")
});
