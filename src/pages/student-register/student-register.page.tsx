import { useState } from "react";
import { StudentRegisterForm } from "./components/student-register-form.component";
import { StudentsListTab } from "./components/students-list-tab.component";
import styles from "./student-register.module.scss";

type StudentPageTab = "create" | "list";

export const StudentRegisterPage = () => {
  const [activeTab, setActiveTab] = useState<StudentPageTab>("create");

  return (
    <div className={styles.page}>
      <h1>Студенты</h1>
      <p className={styles.lead}>
        Регистрация учётных записей студентов с почтой @students.psu.by и
        просмотр списка зарегистрированных студентов.
      </p>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "create" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Регистрация
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "list" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Список студентов
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "create" ? (
          <>
            <p className={styles.tabHint}>
              При первом входе студент сменит временный пароль.
            </p>
            <StudentRegisterForm />
          </>
        ) : (
          <StudentsListTab />
        )}
      </div>
    </div>
  );
};
