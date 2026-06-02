import * as yup from "yup";
export const questionSchema = yup.object({
  text: yup.string().required("Текст вопроса обязателен"),
  type: yup
    .mixed<"single" | "multiple" | "text">()
    .oneOf(["single", "multiple", "text"])
    .required("Тип вопроса обязателен"),
  options: yup
    .array()
    .of(yup.string())
    .test(
      "options-required",
      "Добавьте хотя бы один вариант для выбора",
      function (options) {
        const type = this.parent.type;
        if (type === "text") return true;
        return Array.isArray(options) && options.some((o) => o?.trim() !== "");
      }
    )
});
export const surveySchema = yup.object({
  title: yup.string().required("Название опроса обязательно"),
  description: yup.string(),
  isAnonymous: yup.boolean().default(false),
  hasDeadline: yup.boolean().default(false),
  deadlineAt: yup
    .string()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : value
    )
    .when("hasDeadline", {
      is: true,
      then: (schema) =>
        schema
          .required("Укажите дату завершения опроса")
          .test(
            "future-deadline",
            "Дата завершения должна быть в будущем",
            (value) => Boolean(value && new Date(value).getTime() > Date.now())
          ),
      otherwise: (schema) => schema.notRequired()
    }),
  questions: yup
    .array()
    .of(questionSchema)
    .min(1, "Добавьте хотя бы один вопрос")
});
