import type { TSigninFormDto, TSignupFormDto } from "@/shared";

type TFieldsKey = keyof TSigninFormDto | keyof TSignupFormDto;

export const FIELDS_LABELS = {
  lastName: "Фамилия",
  firstName: "Имя",
  email: "Email",
  password: "Пароль",
  faculty: "Факультет",
  surname: "Отчество",
  numberPhone: "Номер телефона"
} as Record<TFieldsKey, string>;

export const FIELDS_PLACEHOLDERS = {
  lastName: "Фамилия",
  firstName: "Имя",
  email: "Email",
  password: "Пароль",
  faculty: "Факультет",
  surname: "Отчество",
  numberPhone: "Номер телефона"
} as Record<TFieldsKey, string>;

export const FIELDS_KEYS = Object.keys(FIELDS_LABELS) as TFieldsKey[];
