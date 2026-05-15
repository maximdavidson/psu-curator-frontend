import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./group-card.module.scss";
import HatIcon from "../../assets/hat-icon.svg";
import MoreIcon from "../../assets/more-icon.svg";
import type { EditGroupData } from "../CreateGroupModal/CreateGroupModal";

interface GroupCardProps {
  curator: string;
  groupName: string;
  numberStudents: number;
  groupId: string;
  faculty: string;
  courseNumber: number;
  curatorEmail: string;
  headStudentEmail?: string;
  onEdit: (group: EditGroupData) => void;
  onDelete: (groupId: string) => void;
  showStaffActions?: boolean;
}

function formatStudentsCount(count: number): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return `${count} студентов`;
  if (n1 > 1 && n1 < 5) return `${count} студента`;
  if (n1 === 1) return `${count} студент`;
  return `${count} студентов`;
}

export const GroupCard = ({
  curator,
  groupName,
  numberStudents,
  groupId,
  faculty,
  courseNumber,
  curatorEmail,
  headStudentEmail,
  onEdit,
  onDelete,
  showStaffActions = true
}: GroupCardProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const curatorLabel = curator.replace(/\s+/g, " ").trim() || "Не назначен";

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

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
      courseNumber,
      curatorEmail,
      headStudentEmail
    });
  };

  return (
    <article className={styles.card} onClick={handleNavigate}>
      <div className={styles.accentBar} aria-hidden />

      {showStaffActions && (
        <div className={styles.menuWrapper} ref={menuRef}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={toggleMenu}
            aria-label="Действия с группой"
            aria-expanded={isOpen}
          >
            <img src={MoreIcon} alt="" />
          </button>
          {isOpen && (
            <div className={styles.dropdown} role="menu">
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={handleEdit}
              >
                Редактировать
              </button>
              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                onClick={handleDelete}
              >
                Удалить
              </button>
            </div>
          )}
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.iconBadge}>
          <img src={HatIcon} alt="" />
        </div>
        <div className={styles.headerText}>
          <h2 className={styles.groupName}>{groupName}</h2>
          {faculty ? (
            <span className={styles.facultyChip}>{faculty}</span>
          ) : null}
        </div>
      </div>

      <ul className={styles.meta}>
        <li>
          <span className={styles.metaLabel}>Курс</span>
          <span className={styles.metaValue}>{courseNumber}</span>
        </li>
        <li>
          <span className={styles.metaLabel}>Студенты</span>
          <span className={styles.metaValue}>
            {formatStudentsCount(numberStudents)}
          </span>
        </li>
      </ul>

      <footer className={styles.footer}>
        <span className={styles.metaLabel}>Куратор</span>
        <span className={styles.curatorName}>{curatorLabel}</span>
      </footer>
    </article>
  );
};
