import * as yup from "yup";

export const authSchema = yup.object({
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
      "Пароль должен содержать хотя бы один спецсимвол "
    )
    .required("Пароль обязателен")
});

// export const signupFormSchema = signinSchema.shape({
//   firstName: yup.string().required("Имя обязательно"),
//   lastName: yup.string().required("Фамилия обязательна"),
//   surname: yup.string().required("Отчество обязательно"),
//   numberPhone: yup.string().required("Номер телефона обязателен"),
//   faculty: yup.string().required("Факультет обязателен")
// });
