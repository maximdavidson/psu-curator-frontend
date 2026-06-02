import { useGetStudentsQuery } from "@/services/user.api";
import { StudentFundingBadge } from "@/shared/ui/student-funding-badge/student-funding-badge";
import styles from "../student-register.module.scss";

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
            <th>Группа</th>
            <th>Часы пропуска</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={8} className={styles.emptyRow}>
                Студенты не найдены
              </td>
            </tr>
          ) : (
            students.map((student) => (
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
                <td>{student.groupName ?? "—"}</td>
                <td>
                  {formatMissedHours(
                    student.isInGroup,
                    student.totalMissedHours
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
