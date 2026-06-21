import * as yup from "yup";
import { StudentFundingType } from "@/shared/constants/student-funding";

const studentEmailSchema = yup
  .string()
  .trim()
  .email("Введите корректный email")
  .required("Email обязателен")
  .matches(/@students\.psu\.by$/i, "Укажите почту @students.psu.by");

const passwordSchema = yup
  .string()
  .min(8, "Пароль должен быть не менее 8 символов")
  .matches(/[A-Z]/, "Нужна заглавная буква")
  .matches(/[a-z]/, "Нужна строчная буква")
  .matches(/\d/, "Нужна цифра")
  .matches(/[!@#$%^&*(),.?":{}|<>]/, "Нужен спецсимвол")
  .required("Пароль обязателен");

export const studentRegisterSchema = yup.object({
  firstName: yup.string().trim().max(50).required("Имя обязательно"),
  lastName: yup.string().trim().max(50).required("Фамилия обязательна"),
  surname: yup.string().trim().max(50).optional(),
  email: studentEmailSchema,
  password: passwordSchema,
  studentCardNumber: yup
    .string()
    .trim()
    .max(32)
    .required("Номер студенческого билета обязателен"),
  courseNumber: yup
    .number()
    .min(1, "Курс от 1 до 6")
    .max(6, "Курс от 1 до 6")
    .required("Укажите курс"),
  enrollmentYear: yup
    .number()
    .min(2000)
    .max(2100)
    .optional()
    .transform((value, original) =>
      original === "" || original === null || Number.isNaN(value)
        ? undefined
        : value
    ),
  groupId: yup
    .string()
    .trim()
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  faculty: yup
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  fundingType: yup
    .number()
    .oneOf([StudentFundingType.Budget, StudentFundingType.Contract])
    .required("Укажите форму обучения")
});

export type TStudentRegisterFormDto = yup.InferType<
  typeof studentRegisterSchema
>;
