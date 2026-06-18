import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import styles from "./create-group-category-modal.module.scss";
import { FacultyPicker } from "@/shared/ui/faculty-picker/faculty-picker";
import { getRoleStringFromAccessToken } from "@/shared/lib/jwt-claims";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";

interface FormData {
  name: string;
  faculty: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; faculty?: string }) => Promise<void>;
}

const schema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Укажите название раздела")
    .max(100, "Максимум 100 символов"),
  faculty: yup.string().trim().max(100, "Максимум 100 символов").default("")
});

export const CreateGroupCategoryModal = ({
  isOpen,
  onClose,
  onSubmit
}: Props) => {
  const role = getRoleStringFromAccessToken(localStorage.getItem("token"));
  const isAdmin = role?.trim().toLowerCase() === "admin";

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      faculty: ""
    }
  });

  useEffect(() => {
    if (!isOpen) {
      reset({ name: "", faculty: "" });
    }
  }, [isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  const submit = handleSubmit(async (data) => {
    try {
      await onSubmit({
        name: data.name.trim(),
        ...(isAdmin && data.faculty?.trim()
          ? { faculty: data.faculty.trim() }
          : {})
      });
      onClose();
    } catch (error) {
      setError("root", {
        message:
          readApiErrorMessage(error) ?? "Не удалось создать раздел групп."
      });
    }
  });

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <h2 className={styles.title}>Создать раздел</h2>

        <form className={styles.form} onSubmit={submit}>
          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="group-category-name">
                Название раздела
              </label>
              <input
                id="group-category-name"
                className={styles.input}
                type="text"
                placeholder="Например, Группы профилактической работы"
                autoFocus
                {...register("name")}
              />
              {errors.name && (
                <p className={styles.error}>{errors.name.message}</p>
              )}
            </div>

            {isAdmin && (
              <div className={styles.field}>
                <Controller
                  name="faculty"
                  control={control}
                  render={({ field }) => (
                    <FacultyPicker
                      id="group-category-faculty"
                      label="Факультет"
                      value={field.value ?? ""}
                      error={errors.faculty?.message}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            )}

            {errors.root && (
              <p className={styles.error}>{errors.root.message}</p>
            )}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Создание…" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
