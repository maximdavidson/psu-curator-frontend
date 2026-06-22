import { useMemo, useState } from "react";
import {
  useDeleteUserMutation,
  useGetStudentsQuery,
  type StudentListItem
} from "@/services/user.api";
import { StudentFundingBadge } from "@/shared/ui/student-funding-badge/student-funding-badge";
import { StudentFundingType } from "@/shared/constants/student-funding";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";
import styles from "../student-register.module.scss";

const ALL_VALUE = "all";

type MissedHoursSort = "none" | "desc" | "asc";
type FundingFilter = typeof ALL_VALUE | "0" | "1";

function formatFullName(
  lastName: string,
  firstName: string,
  surname?: string | null
): string {
  return [lastName, firstName, surname].filter(Boolean).join(" ");
}

function formatMissedHours(
  isInGroup: boolean,
  totalMissedHours: number
): string {
  if (!isInGroup) {
    return "—";
  }

  return `${Number(totalMissedHours).toLocaleString("ru-RU", {
    maximumFractionDigits: 1
  })} ч`;
}

export const StudentsListTab = () => {
  const { data: students = [], isLoading, isError } = useGetStudentsQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [fundingFilter, setFundingFilter] = useState<FundingFilter>(ALL_VALUE);
  const [facultyFilter, setFacultyFilter] = useState<string>(ALL_VALUE);
  const [missedHoursSort, setMissedHoursSort] =
    useState<MissedHoursSort>("none");

  const facultyOptions = useMemo(() => {
    const faculties = new Set<string>();
    students.forEach((student) => {
      const faculty = student.faculty?.trim();
      if (faculty) {
        faculties.add(faculty);
      }
    });
    return Array.from(faculties).sort((left, right) =>
      left.localeCompare(right, "ru")
    );
  }, [students]);

  const visibleStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      if (
        fundingFilter !== ALL_VALUE &&
        String(student.fundingType) !== fundingFilter
      ) {
        return false;
      }

      if (
        facultyFilter !== ALL_VALUE &&
        (student.faculty?.trim() ?? "") !== facultyFilter
      ) {
        return false;
      }

      return true;
    });

    if (missedHoursSort === "none") {
      return filtered;
    }

    const missedHoursValue = (student: StudentListItem) =>
      student.isInGroup ? Number(student.totalMissedHours) : -1;

    return [...filtered].sort((left, right) => {
      const diff = missedHoursValue(left) - missedHoursValue(right);
      return missedHoursSort === "asc" ? diff : -diff;
    });
  }, [students, fundingFilter, facultyFilter, missedHoursSort]);

  const handleDeleteStudent = async (student: StudentListItem) => {
    const fullName = formatFullName(
      student.lastName,
      student.firstName,
      student.surname
    );

    const groupHint = student.groupName
      ? ` Студент будет удалён из группы «${student.groupName}».`
      : "";

    if (
      !window.confirm(
        `Удалить студента ${fullName} (${student.email})?${groupHint} Учётная запись и связанные данные будут удалены без возможности восстановления.`
      )
    ) {
      return;
    }

    setActionError(null);
    setDeletingStudentId(student.id);

    try {
      await deleteUser(student.id).unwrap();
    } catch (error) {
      setActionError(
        readApiErrorMessage(error) ?? "Не удалось удалить студента."
      );
    } finally {
      setDeletingStudentId(null);
    }
  };

  if (isLoading) {
    return <p className={styles.listMuted}>Загрузка списка студентов…</p>;
  }

  if (isError) {
    return (
      <p className={styles.listError}>
        Не удалось загрузить список студентов. Попробуйте обновить страницу.
      </p>
    );
  }

  return (
    <div className={styles.listWrap}>
      {actionError && <p className={styles.listError}>{actionError}</p>}

      <div className={styles.filters}>
        <label className={styles.filterField}>
          <span>Форма обучения</span>
          <select
            value={fundingFilter}
            onChange={(event) =>
              setFundingFilter(event.target.value as FundingFilter)
            }
          >
            <option value={ALL_VALUE}>Все</option>
            <option value={String(StudentFundingType.Budget)}>Бюджет</option>
            <option value={String(StudentFundingType.Contract)}>Платник</option>
          </select>
        </label>

        <label className={styles.filterField}>
          <span>Факультет</span>
          <select
            value={facultyFilter}
            onChange={(event) => setFacultyFilter(event.target.value)}
          >
            <option value={ALL_VALUE}>Все</option>
            {facultyOptions.map((faculty) => (
              <option key={faculty} value={faculty}>
                {faculty}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filterField}>
          <span>Часы пропуска</span>
          <select
            value={missedHoursSort}
            onChange={(event) =>
              setMissedHoursSort(event.target.value as MissedHoursSort)
            }
          >
            <option value="none">Без сортировки</option>
            <option value="desc">По убыванию</option>
            <option value="asc">По возрастанию</option>
          </select>
        </label>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.studentsTable}>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Email</th>
              <th>№ студенческого</th>
              <th>Курс</th>
              <th>Год поступления</th>
              <th>Форма обучения</th>
              <th>Факультет</th>
              <th>Группа</th>
              <th>Часы пропуска</th>
              <th className={styles.actionsCol}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {visibleStudents.length === 0 ? (
              <tr>
                <td colSpan={10} className={styles.emptyRow}>
                  Студенты не найдены
                </td>
              </tr>
            ) : (
              visibleStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    {formatFullName(
                      student.lastName,
                      student.firstName,
                      student.surname
                    )}
                  </td>
                  <td>{student.email}</td>
                  <td>{student.studentCardNumber}</td>
                  <td>{student.courseNumber}</td>
                  <td>{student.enrollmentYear}</td>
                  <td>
                    <StudentFundingBadge fundingType={student.fundingType} />
                  </td>
                  <td>{student.faculty ?? "—"}</td>
                  <td>{student.groupName ?? "—"}</td>
                  <td>
                    {formatMissedHours(
                      student.isInGroup,
                      student.totalMissedHours
                    )}
                  </td>
                  <td className={styles.actionsCol}>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      disabled={isDeleting && deletingStudentId === student.id}
                      onClick={() => handleDeleteStudent(student)}
                    >
                      {isDeleting && deletingStudentId === student.id
                        ? "Удаление…"
                        : "Удалить"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
