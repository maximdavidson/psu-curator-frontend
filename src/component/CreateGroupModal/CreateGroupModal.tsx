import { useEffect } from "react";
import styles from "./modal.module.scss";
import {
  Controller,
  useForm,
  useWatch,
  type Resolver,
  type SubmitHandler
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { UserEmailPicker } from "@/shared/ui/user-email-picker/user-email-picker";
import { FacultyPicker } from "@/shared/ui/faculty-picker/faculty-picker";

const optionalEmail = yup
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional()
  .email("Введите корректный email");

export interface CreateGroupFormData {
  groupName: string;
  faculty: string;
  department?: string;
  courseNumber: number;
  curatorEmail?: string;
  headStudentEmail?: string;
}

export interface EditGroupData {
  id: string;
  name: string;
  faculty: string;
  department?: string;
  courseNumber: number;
  curatorEmail?: string;
  headStudentEmail?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateGroupFormData) => void | Promise<void>;
  onUpdate: (data: EditGroupData) => void | Promise<void>;
  initialData?: EditGroupData | null;
  mode: "create" | "edit";
}

const groupSchema = yup.object({
  groupName: yup
    .string()
    .trim()
    .required("Название группы обязательно")
    .max(50, "Максимум 50 символов"),
  faculty: yup
    .string()
    .trim()
    .required("Укажите факультет")
    .max(100, "Максимум 100 символов"),
  department: yup
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .max(200, "Максимум 200 символов")
    .optional(),
  courseNumber: yup
    .number()
    .min(1, "Курс от 1 до 6")
    .max(6, "Курс от 1 до 6")
    .required("Укажите курс"),
  curatorEmail: optionalEmail,
  headStudentEmail: optionalEmail
});

const CreateGroupModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  mode
}: CreateGroupModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<CreateGroupFormData>({
    resolver: yupResolver(groupSchema) as Resolver<CreateGroupFormData>,
    defaultValues: {
      groupName: "",
      faculty: "",
      department: "",
      courseNumber: 1,
      curatorEmail: "",
      headStudentEmail: ""
    }
  });

  const groupNameValue = useWatch({ control, name: "groupName" }) ?? "";

  useEffect(() => {
    if (isOpen && mode === "edit" && initialData) {
      reset({
        groupName: initialData.name,
        faculty: initialData.faculty,
        department: initialData.department ?? "",
        courseNumber: initialData.courseNumber,
        curatorEmail: initialData.curatorEmail ?? "",
        headStudentEmail: initialData.headStudentEmail ?? ""
      });
    }
    if (!isOpen) {
      reset({
        groupName: "",
        faculty: "",
        department: "",
        courseNumber: 1,
        curatorEmail: "",
        headStudentEmail: ""
      });
    }
  }, [isOpen, mode, initialData, reset]);

  const onSubmit: SubmitHandler<CreateGroupFormData> = async (data) => {
    const normalized: CreateGroupFormData = {
      groupName: data.groupName.trim(),
      faculty: data.faculty.trim(),
      department: data.department?.trim() || undefined,
      courseNumber: data.courseNumber,
      curatorEmail: data.curatorEmail?.trim() || undefined,
      headStudentEmail: data.headStudentEmail?.trim() || undefined
    };

    if (mode === "edit" && initialData) {
      await onUpdate({
        id: initialData.id,
        name: normalized.groupName,
        faculty: normalized.faculty,
        department: normalized.department,
        courseNumber: normalized.courseNumber,
        curatorEmail: normalized.curatorEmail,
        headStudentEmail: normalized.headStudentEmail
      });
    } else {
      await onCreate(normalized);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.ModalOverlay}>
      <div className={styles.Modal}>
        <div className={styles.ModalHeader}>
          <h2>
            {mode === "edit" ? "Редактирование группы" : "Создание группы"}
          </h2>
          <img
            className={styles.CloseBtn}
            onClick={onClose}
            src="./icons/X.svg"
            alt="Закрыть"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.ModalBody}>
          <div className={styles.Group}>
            <label htmlFor="group-name">Название группы</label>
            <input
              id="group-name"
              type="text"
              maxLength={50}
              {...register("groupName")}
            />
            <div className={styles.CharCounter}>{groupNameValue.length}/50</div>
            {errors.groupName && (
              <p className={styles.Error}>{errors.groupName.message}</p>
            )}
          </div>

          <Controller
            name="faculty"
            control={control}
            render={({ field }) => (
              <FacultyPicker
                id="group-faculty"
                label="Факультет"
                value={field.value ?? ""}
                error={errors.faculty?.message}
                onChange={field.onChange}
              />
            )}
          />

          <div className={styles.Group}>
            <label htmlFor="group-department">Кафедра</label>
            <input
              id="group-department"
              type="text"
              maxLength={200}
              placeholder="Например: Прикладная информатика"
              {...register("department")}
            />
            {errors.department && (
              <p className={styles.Error}>{errors.department.message}</p>
            )}
          </div>

          <div className={styles.Group}>
            <label htmlFor="group-course">Курс</label>
            <select
              id="group-course"
              {...register("courseNumber", { valueAsNumber: true })}
            >
              <option value="" disabled hidden>
                Выберите курс
              </option>
              <option value={1}>1 курс</option>
              <option value={2}>2 курс</option>
              <option value={3}>3 курс</option>
              <option value={4}>4 курс</option>
              <option value={5}>5 курс</option>
              <option value={6}>6 курс</option>
            </select>
            {errors.courseNumber && (
              <p className={styles.Error}>{errors.courseNumber.message}</p>
            )}
          </div>

          <Controller
            name="curatorEmail"
            control={control}
            render={({ field }) => (
              <UserEmailPicker
                id="group-curator"
                label="Куратор (опционально)"
                placeholder="Имя или email куратора"
                value={field.value ?? ""}
                error={errors.curatorEmail?.message}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="headStudentEmail"
            control={control}
            render={({ field }) => (
              <UserEmailPicker
                id="group-headman"
                label="Староста (опционально)"
                placeholder="Имя или email старосты"
                value={field.value ?? ""}
                error={errors.headStudentEmail?.message}
                onChange={field.onChange}
              />
            )}
          />

          <div className={styles.ModalFooter}>
            <button
              type="button"
              className={styles.CancelBtn}
              onClick={onClose}
            >
              Отмена
            </button>

            <button type="submit" className={styles.CreateBtn}>
              {mode === "edit" ? "Сохранить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
