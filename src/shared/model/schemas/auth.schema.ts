import * as yup from "yup";

export const signinSchema = yup.object({
  email: yup
    .string()
    .email("введите корректный email")
    .required("Электронная почта обязательна"),
  password: yup.string().min(8).required("Пароль обязателен")
});

export const signupFormSchema = signinSchema.shape({
  firstName: yup.string().required("Имя обязательно"),
  lastName: yup.string().required("Фамилия обязательна"),
  surname: yup.string().required("Отчество обязательно"),
  numberPhone: yup.string().required("Номер телефона обязателен"),
  faculty: yup.string().required("Факультет обязателен")
});
