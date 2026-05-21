import type { InputType } from "@/shared";
import type { TAuthFormDto } from "@/shared/model/schemas/auth.schema";
type TFieldsKey = keyof TAuthFormDto;
export const FIELDS_LABELS = {
  firstName: "Имя",
  lastName: "Фамилия",
  email: "Почта",
  password: "Пароль"
} as Record<TFieldsKey, string>;
export const FIELDS_TYPES = {
  firstName: "text",
  lastName: "text",
  email: "email",
  password: "password"
} as Record<TFieldsKey, InputType>;
export const FIELDS_PLACEHOLDERS = {
  firstName: "Иван",
  lastName: "Иванов",
  email: "ivanov@students.psu.by",
  password: "Пароль"
} as Record<TFieldsKey, string>;
export const FIELDS_KEYS = Object.keys(FIELDS_LABELS) as TFieldsKey[];
