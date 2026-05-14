import type { InputType } from "@/shared";
import type { TAuthFormDto } from "@/shared/model/schemas/auth.schema";

type TFieldsKey = keyof TAuthFormDto;

export const FIELDS_LABELS = {
  email: "Email",
  password: "Пароль"
} as Record<TFieldsKey, string>;

export const FIELDS_TYPES = {
  email: "email",
  password: "password"
} as Record<TFieldsKey, InputType>;

// в прошлой дто на регистрацию было больше полей и тогда это было полезно
// в принципе можно оставить для лучших времен

export const FIELDS_PLACEHOLDERS = {
  email: "Email",
  password: "Пароль"
} as Record<TFieldsKey, string>;

export const FIELDS_KEYS = Object.keys(FIELDS_LABELS) as TFieldsKey[];
