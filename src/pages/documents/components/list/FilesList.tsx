import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../model/db";
import type { IFileEntity } from "../../model/types";
import styles from "./FilesList.module.scss";
import { FilesItem } from "./FilesItem";
export const FilesList = () => {
  const files = useLiveQuery(
    () => db.files.reverse().toArray() as Promise<IFileEntity[]>,
    [] as IFileEntity[]
  );

  const handleDelete = async (id?: number) => {
    if (id !== undefined) {
      await db.files.delete(id);
    }
  };

  const handleDownload = (file: IFileEntity) => {
    const url = URL.createObjectURL(file.content);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!files) return <div>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Загруженные файлы ({files.length})</h3>
      {files.length === 0 ? (
        <p>Файлов пока нет</p>
      ) : (
        <ul className={styles.list}>
          {files.map((file) => (
            <FilesItem
              key={file.id}
              {...file}
              handleDelete={handleDelete}
              handleDownload={handleDownload}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
