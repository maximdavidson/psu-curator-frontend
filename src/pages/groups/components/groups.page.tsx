import { GroupCard } from "@/component/GroupCards/group-card.component";
import styles from "./groups.module.scss";

export const GroupsPage = () => {
  return (
    <>
      <div className={styles.page}>
        <h1 className={styles.title}>Добро пожаловать, Сергей Валерьевич!</h1>
        <GroupCard />
      </div>
    </>
  );
};
