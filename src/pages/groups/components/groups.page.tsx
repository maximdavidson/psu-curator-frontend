import styles from "./groups.module.scss";
import GroupsPageCreate from "@/component/CreateGroupModal/OpenModal";

export const GroupsPage = () => {
  return (
    <>
      <div className={styles.page}>
        <h1 className={styles.title}>Добро пожаловать, Сергей Валерьевич!</h1>
        <GroupsPageCreate />
      </div>
    </>
  );
};
