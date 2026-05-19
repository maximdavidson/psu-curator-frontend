import styles from "./FilesList.module.scss";
type TProps = {
  id: string;
  name: string;
  size: number;
  createdAt: number;
  handleDownload: () => void;
  handleDelete: (id?: string) => void;
};
export const FilesItem = ({
  id,
  name,
  size,
  handleDownload,
  handleDelete
}: TProps) => {
  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>{size} bytes</span>
      </div>
      <div className={styles.actions}>
        <button className={styles.btnDownload} onClick={handleDownload}>
          Скачать
        </button>
        <button className={styles.btnDelete} onClick={() => handleDelete(id)}>
          Удалить
        </button>
      </div>
    </li>
  );
};
