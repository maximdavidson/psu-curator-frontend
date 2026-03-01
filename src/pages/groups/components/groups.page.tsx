import { GroupCard } from "@/component/GroupCards/group-card.component";
import styles from "./groups.module.scss";
import GroupsPageCreate from "@/component/CreateGroupModal/OpenModal";

export const GroupsPage = () => {
  return (
    <>
      <div className={styles.page}>
        <h1 className={styles.title}>Добро пожаловать, Сергей Валерьевич!</h1>
        <GroupCard
          curator="Коноплева Галина Филипповна"
          groupName="22-ИТ-1"
          numberStudents={22}
        />
        <GroupsPageCreate />
      </div>
    </>
  );
};
