import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./group-card.module.scss";
import HatIcon from "../../assets/hat-icon.svg";
import BellIcon from "../../assets/notification-card-icon.svg";
import MoreIcon from "../../assets/more-icon.svg";

interface EditGroupData {
  id: string;
  name: string;
  faculty: string;
  courseNumber: number;
}

interface GroupCardProps {
  curator: string;
  groupName: string;
  numberStudents: number;
  groupId: string;
  faculty: string;
  courseNumber: number;
  onEdit: (group: EditGroupData) => void;
  onDelete: (groupId: string) => void;
}

export const GroupCard = ({
  curator,
  groupName,
  numberStudents,
  groupId,
  faculty,
  courseNumber,
  onEdit,
  onDelete
}: GroupCardProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = () => {
    navigate(`/groups/${groupId}`);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Удалить группу?")) return;

    onDelete(groupId);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);

    onEdit({
      id: groupId,
      name: groupName,
      faculty,
      courseNumber
    });
  };

  return (
    <div className={styles.wrapper} onClick={handleNavigate}>
      <div className={styles.card}>
        <div className={styles.actions}>
          <button
            className={styles.iconButton}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={BellIcon} alt="notifications" />
          </button>

          <div className={styles.menuWrapper}>
            <button className={styles.iconButton} onClick={toggleMenu}>
              <img src={MoreIcon} alt="more" />
            </button>

            {isOpen && (
              <div className={styles.dropdown}>
                <button className={styles.dropdownItem} onClick={handleEdit}>
                  Редактировать
                </button>

                <button className={styles.dropdownItem} onClick={handleDelete}>
                  Удалить
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.iconWrapper}>
          <img src={HatIcon} alt="group" />
        </div>

        <div className={styles.info}>
          <div className={styles.groupName}>{groupName}</div>

          <div>
            <p className={styles.curator}>
              Куратор: <b>{curator}</b>
            </p>

            <p className={styles.count}>
              Количество студентов: <b>{numberStudents}</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
