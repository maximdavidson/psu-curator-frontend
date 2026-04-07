import { useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./group-detail.module.scss";
import { FeedTab } from "./components/feed-tab/feed-tab.component";
import { useGetGroupsQuery } from "../groups/group.api";

export const GroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [activeTab, setActiveTab] = useState<"feed" | "members">("feed");

  const { data: groups, isLoading } = useGetGroupsQuery();

  const group = groups?.find((g) => g.id === groupId);

  if (isLoading) {
    return <div className={styles.page}>Загрузка...</div>;
  }

  if (!group) {
    return <div className={styles.page}>Группа не найдена</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{group.name}</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "feed" ? styles.active : ""}`}
          onClick={() => setActiveTab("feed")}
        >
          Лента
        </button>

        <button
          className={`${styles.tab} ${activeTab === "members" ? styles.active : ""}`}
          onClick={() => setActiveTab("members")}
        >
          Участники
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "feed" && <FeedTab />}
        {activeTab === "members" && <p>Здесь будут участники группы</p>}
      </div>
    </div>
  );
};
