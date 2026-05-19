import styles from "./groups.module.scss";
import GroupsPageCreate from "@/component/CreateGroupModal/OpenModal";
import { useCurrentUserDisplayName } from "@/hooks/use-current-user";
export const GroupsPage = () => {
  const { displayName, isLoading } = useCurrentUserDisplayName();
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.greeting}>Добро пожаловать</p>
        <h1 className={styles.title}>
          {isLoading ? (
            <span className={styles.nameSkeleton} aria-hidden />
          ) : (
            displayName
          )}
        </h1>
        <p className={styles.subtitle}>Группы факультета</p>
      </header>
      <GroupsPageCreate />
    </div>
  );
};
