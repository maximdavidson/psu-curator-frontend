import { useEffect } from "react";
import styles from "./modal.module.scss";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { groupSchema } from "../../shared/model/schemas/check.group";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newGroup: Group) => void;
}

export interface Group {
  groupName: string;
  curator: string;
  numberStudents: number;
}

const CreateGroupModal = ({
  isOpen,
  onClose,
  onCreate
}: CreateGroupModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<Group>({
    resolver: yupResolver(groupSchema),
    defaultValues: {
      groupName: "",
      curator: "",
      numberStudents: 0
    }
  });

  const groupNameValue = watch("groupName");

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data: Group) => {
    onCreate({ ...data, numberStudents: 0 });
    onClose();
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.ModalOverlay}>
      <div className={styles.Modal}>
        <div className={styles.ModalHeader}>
          <h2>Создание группы</h2>
          <img
            className={styles.CloseBtn}
            onClick={onClose}
            src="./icons/X.svg"
            alt="Закрыть"
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.ModalBody}>
          <div className={styles.Group}>
            <label>Имя группы</label>
            <input type="text" maxLength={50} {...register("groupName")} />
            <div
              className={`${styles.CharCounter} ${
                groupNameValue.length === 50 ? styles.limit : ""
              }`}
            >
              {groupNameValue.length}/50
            </div>
            {errors.groupName && (
              <p className={styles.Error}>{errors.groupName.message}</p>
            )}
          </div>

          <div className={styles.Group}>
            <label>Куратор группы</label>
            <select {...register("curator")}>
              <option value="" disabled hidden></option>
              <option value="sample1">sample1</option>
              <option value="sample2">sample2</option>
              <option value="sample3">sample3</option>
            </select>
            {errors.curator && (
              <p className={styles.Error}>{errors.curator.message}</p>
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
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
