import { useEffect } from "react";
import styles from "./modal.module.scss";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export interface CreateGroupFormData {
  groupName: string;
  faculty: string;
  courseNumber: number;
  curatorEmail: string;
  headStudentEmail?: string;
}

export interface EditGroupData {
  id: string;
  name: string;
  faculty: string;
  courseNumber: number;
  curatorEmail?: string;
  headStudentEmail?: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateGroupFormData) => void;
  onUpdate: (data: EditGroupData) => void;
  initialData?: EditGroupData | null;
  mode: "create" | "edit";
}

const groupSchema = yup.object({
  groupName: yup
    .string()
    .required("Название группы обязательно")
    .max(50, "Максимум 50 символов"),

  faculty: yup.string().required("Выберите факультет"),

  courseNumber: yup
    .number()
    .min(1, "Курс от 1 до 6")
    .max(6, "Курс от 1 до 6")
    .required("Укажите курс"),

  curatorEmail: yup
    .string()
    .email("Введите корректный email")
    .required("Введите email куратора"),

  headStudentEmail: yup.string().email("Введите корректный email").optional()
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
    watch,
    formState: { errors }
  } = useForm<CreateGroupFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(groupSchema) as any,
    defaultValues: {
      groupName: "",
      faculty: "",
      courseNumber: 1,
      curatorEmail: "",
      headStudentEmail: undefined
    }
  });

  const groupNameValue = watch("groupName");

  useEffect(() => {
    if (isOpen && mode === "edit" && initialData) {
      reset({
        groupName: initialData.name,
        faculty: initialData.faculty,
        courseNumber: initialData.courseNumber,
        curatorEmail: initialData.curatorEmail ?? "",
        headStudentEmail: initialData.headStudentEmail ?? undefined
      });
    }

    if (!isOpen) {
      reset({
        groupName: "",
        faculty: "",
        courseNumber: 1,
        curatorEmail: "",
        headStudentEmail: undefined
      });
    }
  }, [isOpen, mode, initialData, reset]);

  const onSubmit: SubmitHandler<CreateGroupFormData> = (data) => {
    if (mode === "edit" && initialData) {
      onUpdate({
        id: initialData.id,
        name: data.groupName,
        faculty: data.faculty,
        courseNumber: data.courseNumber,
        curatorEmail: data.curatorEmail,
        headStudentEmail: data.headStudentEmail
      });
    } else {
      onCreate(data);
    }

    onClose();
    reset();
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
            <label>Название группы</label>
            <input type="text" maxLength={50} {...register("groupName")} />
            <div className={styles.CharCounter}>
              {groupNameValue?.length || 0}/50
            </div>
            {errors.groupName && (
              <p className={styles.Error}>{errors.groupName.message}</p>
            )}
          </div>

          <div className={styles.Group}>
            <label>Факультет</label>
            <select {...register("faculty")}>
              <option value="" disabled hidden>
                Выберите факультет
              </option>
              <option value="ФИТ">ФИТ</option>
              <option value="ФЭУ">ФЭУ</option>
              <option value="ФК">ФК</option>
            </select>
            {errors.faculty && (
              <p className={styles.Error}>{errors.faculty.message}</p>
            )}
          </div>

          <div className={styles.Group}>
            <label>Курс</label>
            <select {...register("courseNumber", { valueAsNumber: true })}>
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

          <div className={styles.Group}>
            <label>Email куратора</label>
            <input
              type="email"
              placeholder="curator@psu.ru"
              {...register("curatorEmail")}
            />
            {errors.curatorEmail && (
              <p className={styles.Error}>{errors.curatorEmail.message}</p>
            )}
          </div>

          <div className={styles.Group}>
            <label>Email старосты (опционально)</label>
            <input
              type="email"
              placeholder="headman@psu.ru"
              {...register("headStudentEmail")}
            />
            {errors.headStudentEmail && (
              <p className={styles.Error}>{errors.headStudentEmail.message}</p>
            )}
          </div>

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
