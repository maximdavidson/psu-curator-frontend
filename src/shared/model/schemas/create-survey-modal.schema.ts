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
  hasTimeLimit: yup.boolean().default(false),
  timeLimitMinutes: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? undefined : value
    )
    .when("hasTimeLimit", {
      is: true,
      then: (schema) =>
        schema
          .typeError("Укажите число минут")
          .integer("Лимит указывается целым числом минут")
          .min(1, "Минимум 1 минута")
          .max(1440, "Не более 24 часов (1440 минут)")
          .required("Укажите лимит времени в минутах"),
      otherwise: (schema) => schema.notRequired()
    }),
  questions: yup
    .array()
    .of(questionSchema)
    .min(1, "Добавьте хотя бы один вопрос")
});
