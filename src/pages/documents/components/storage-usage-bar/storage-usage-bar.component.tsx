import { formatSize } from "../../model/format-size";
import styles from "./storage-usage-bar.module.scss";

type StorageUsageBarProps = {
  usedBytes: number;
  limitBytes: number;
};

export const StorageUsageBar = ({
  usedBytes,
  limitBytes
}: StorageUsageBarProps) => {
  const safeLimit = limitBytes > 0 ? limitBytes : 1;
  const percent = Math.min(100, Math.round((usedBytes / safeLimit) * 100));
  const isNearLimit = percent >= 90;
  const isFull = usedBytes >= limitBytes;

  return (
    <section className={styles.storage}>
      <div className={styles.header}>
        <span className={styles.label}>Хранилище</span>
        <span className={styles.value}>
          {formatSize(usedBytes)} из {formatSize(limitBytes)}
        </span>
      </div>

      <div className={styles.track} aria-hidden="true">
        <div
          className={`${styles.fill} ${isNearLimit ? styles.fillWarning : ""} ${isFull ? styles.fillFull : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className={styles.hint}>
        {isFull
          ? "Лимит исчерпан. Удалите файлы, чтобы загрузить новые."
          : `Использовано ${percent}% доступного места.`}
      </p>
    </section>
  );
};
