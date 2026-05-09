import { useState } from "react";
import styles from "../teachers.module.scss";
import type { ITeacher } from "../types";

interface IProps {
  onClose: () => void;
  onCreate: (teacher: ITeacher) => void;
}

export const TeacherModal = ({ onClose, onCreate }: IProps) => {
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
  };

  const handleCreate = () => {
    if (!lastName || !firstName) return;

    onCreate({
      id: Date.now().toString(),
      lastName,
      firstName,
      middleName,
      faculty,
      department,
      avatar
    });

    onClose();
  };

  return (
    <div className={styles["modal-overlay"]} onClick={onClose}>
      <div className={styles["modal"]} onClick={(e) => e.stopPropagation()}>
        <div className={styles["modal-header"]}>
          <h2>Добавить преподавателя</h2>
        </div>

        <div className={styles["modal-body"]}>
          <input
            placeholder="Фамилия"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <input
            placeholder="Имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            placeholder="Отчество"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />

          <input
            placeholder="Факультет"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
          />

          <input
            placeholder="Кафедра"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />

          <label className={styles["avatar-upload"]}>
            {avatar ? (
              <img src={avatar} alt="avatar" />
            ) : (
              <div className={styles["avatar-placeholder"]}>
                <span>Загрузить аватар</span>
                <small>PNG, JPG до 5MB</small>
              </div>
            )}

            <input type="file" accept="image/*" onChange={handleFile} />
          </label>
        </div>

        <div className={styles["modal-footer"]}>
          <button className={styles["cancel-btn"]} onClick={onClose}>
            Отмена
          </button>

          <button className={styles["primary-btn"]} onClick={handleCreate}>
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};
