import { useState, useEffect, useMemo } from "react";
import styles from "./teachers.module.scss";
import { TeacherCard } from "./components/teacher-card.component";
import { TeacherModal } from "./components/teacher-modal.component";
import type { ITeacher } from "./types";
import { getSearchText, subscribeToSearch } from "@/app/store/searchStore";

export const TeachersPage = () => {
  const [teachers, setTeachers] = useState<ITeacher[]>([]);
  const [searchText, setSearchText] = useState(getSearchText());
  const [open, setOpen] = useState(false);

  const filterTeachers = (search: string, allTeachers: ITeacher[]) => {
    if (!search.trim()) {
      return allTeachers;
    }

    const lowerSearchText = search.toLowerCase();
    return allTeachers.filter((teacher) => {
      return (
        teacher.lastName?.toLowerCase().includes(lowerSearchText) ||
        teacher.firstName?.toLowerCase().includes(lowerSearchText) ||
        teacher.middleName?.toLowerCase().includes(lowerSearchText) ||
        teacher.faculty?.toLowerCase().includes(lowerSearchText) ||
        teacher.department?.toLowerCase().includes(lowerSearchText)
      );
    });
  };

  const filteredTeachers = useMemo(() => {
    return filterTeachers(searchText, teachers);
  }, [searchText, teachers]);

  useEffect(() => {
    const unsubscribe = subscribeToSearch((newSearchText: string) => {
      setSearchText(newSearchText);
    });

    return unsubscribe;
  }, []);

  const handleCreate = (teacher: ITeacher) => {
    setTeachers((prev) => [teacher, ...prev]);
  };

  const handleDelete = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Преподаватели</h1>
        <button onClick={() => setOpen(true)}>Добавить</button>
      </div>

      <div className={styles.grid}>
        {filteredTeachers.map((t) => (
          <TeacherCard key={t.id} teacher={t} onDelete={handleDelete} />
        ))}
      </div>

      {filteredTeachers.length === 0 && teachers.length > 0 && (
        <div className={styles.empty}>Ничего не найдено</div>
      )}

      {open && (
        <TeacherModal onClose={() => setOpen(false)} onCreate={handleCreate} />
      )}
    </div>
  );
};
