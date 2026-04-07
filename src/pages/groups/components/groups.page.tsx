import styles from "./groups.module.scss";
import GroupsPageCreate from "@/component/CreateGroupModal/OpenModal";

const getUserEmail = (): string => {
  return localStorage.getItem("email") || "";
};

export const GroupsPage = () => {
  const email = getUserEmail();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        Добро пожаловать, {email || "пользователь"}!
      </h1>
      <GroupsPageCreate />
    </div>
  );
};
