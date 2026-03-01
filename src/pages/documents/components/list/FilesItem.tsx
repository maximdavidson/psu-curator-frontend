import { formatSize } from "../../model/format-size";
import type { IFileEntity } from "../../model/types";
import styles from "./FilesList.module.scss";

type TProps = IFileEntity & {
  handleDownload: (file: IFileEntity) => void;
  handleDelete: (id?: number) => void;
};

export const FilesItem = ({
  handleDelete,
  handleDownload,
  ...file
}: TProps) => {
  return (
    <li key={file.id} className={styles.item}>
      <div className={styles.info}>
        <span className={styles.name}>{file.name}</span>
        <span className={styles.meta}>
          {formatSize(file.size)} • {new Date(file.createdAt).toLocaleString()}
        </span>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.btnDownload}
          onClick={() => handleDownload(file)}
        >
          Скачать
        </button>
        <button
          className={styles.btnDelete}
          onClick={() => handleDelete(file.id)}
        >
          Удалить
        </button>
      </div>
    </li>
  );
};
