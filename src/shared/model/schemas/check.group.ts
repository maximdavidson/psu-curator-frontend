import * as yup from "yup";

export const groupSchema = yup.object({
  groupName: yup
    .string()
    .required("Имя группы обязательно")
    .max(50, "Имя группы не должно быть длиннее 50 символов")
    .matches(/^[А-Яа-яЁё0-9]+(-[А-Яа-яЁё0-9]+)*$/, "Некорректный формат ввода"),
  curator: yup.string().required("Куратор обязателен"),
  numberStudents: yup.number().default(0)
});
