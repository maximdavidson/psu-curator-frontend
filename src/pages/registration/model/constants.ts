import type { TAuthFormDto } from "@/shared/model/types/auth.types";

type TFieldsKey = keyof TAuthFormDto;

export const FIELDS_LABELS = {
  email: "Email",
  password: "Пароль"
} as Record<TFieldsKey, string>;

// в прошлой дто на регистрацию было больше полей и тогда это было полезно
// в принципе можно оставить для лучших времен

export const FIELDS_PLACEHOLDERS = {
  email: "Email",
  password: "Пароль"
} as Record<TFieldsKey, string>;

export const FIELDS_KEYS = Object.keys(FIELDS_LABELS) as TFieldsKey[];
