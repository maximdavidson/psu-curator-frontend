import { useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./group-detail.module.scss";
import { FeedTab } from "./components/feed-tab/feed-tab.component";

export const GroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [activeTab, setActiveTab] = useState<"feed" | "members">("feed");

  const groupName = `Группа №${groupId}`;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{groupName}</h1>

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
