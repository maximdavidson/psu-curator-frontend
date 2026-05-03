import { useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./group-detail.module.scss";
import { FeedTab } from "./components/feed-tab/feed-tab.component";
import { useGetGroupByIdQuery } from "../groups/group.api";

export const GroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [activeTab, setActiveTab] = useState<"feed" | "members">("feed");

  const {
    data: group,
    isLoading,
    isError,
    refetch
  } = useGetGroupByIdQuery(groupId!, {
    skip: !groupId
  });

  if (!groupId) {
    return <div className={styles.page}>Некорректный ID группы</div>;
  }

  if (isLoading) {
    return <div className={styles.page}>Загрузка...</div>;
  }

  if (isError || !group) {
    return <div className={styles.page}>Группа не найдена</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{group.name}</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "feed" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("feed")}
        >
          Лента
        </button>

        <button
          className={`${styles.tab} ${
            activeTab === "members" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("members")}
        >
          Участники
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "feed" && (
          <FeedTab
            groupId={group.id}
            feed={group.feedItems}
            onRefetch={refetch} // 👈 передаём refetch
          />
        )}

        {activeTab === "members" && <p>Здесь будут участники группы</p>}
      </div>
    </div>
  );
};
