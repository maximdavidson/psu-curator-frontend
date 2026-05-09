import { useState } from "react";
import styles from "../teachers.module.scss";
import type { ITeacher } from "../types";
import MessageIcon from "@/assets/message-icon.svg";
import MoreIcon from "@/assets/more-icon.svg"; // добавь любую иконку "..."

interface IProps {
  teacher: ITeacher;
  onDelete: (id: string) => void;
}

export const TeacherCard = ({ teacher, onDelete }: IProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles["teacher-card"]}>
      <div className={styles["teacher-card__header"]}>
        <img
          className={styles["teacher-card__avatar"]}
          src={
            teacher.avatar ||
            "https://via.placeholder.com/80x80.png?text=Avatar"
          }
          alt="avatar"
        />

        <div className={styles["teacher-card__actions"]}>
          <button className={styles["teacher-card__message-btn"]} type="button">
            <img src={MessageIcon} alt="message" />
          </button>

          <div className={styles["teacher-card__menu"]}>
            <button
              className={styles["teacher-card__more-btn"]}
              onClick={() => setOpen((prev) => !prev)}
              type="button"
            >
              <img src={MoreIcon} alt="more" />
            </button>

            {open && (
              <div className={styles["teacher-card__dropdown"]}>
                <button
                  onClick={() => {
                    onDelete(teacher.id);
                    setOpen(false);
                  }}
                  className={styles["teacher-card__delete-btn"]}
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles["teacher-card__body"]}>
        <div className={styles["teacher-card__name"]}>
          {teacher.lastName} {teacher.firstName} {teacher.middleName}
        </div>

        <div className={styles["teacher-card__meta"]}>
          <div>Факультет: {teacher.faculty}</div>
          <div>Кафедра: {teacher.department}</div>
        </div>
      </div>
    </div>
  );
};
