import { useState } from "react";
import { FileUploadModal } from "./modal/upload-file-modal";
import styles from "./documets.module.scss";
import { FilesList } from "./list/FilesList";
import { StorageUsageBar } from "./storage-usage-bar/storage-usage-bar.component";
import { useGetUserFilesQuery } from "../documents.api";

export const DocumentsPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useGetUserFilesQuery();

  const isStorageFull = data ? data.usedBytes >= data.limitBytes : false;

  const handleToggleModalVisibility = () => {
    setIsOpen((state) => !state);
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>Документы</h1>

          <button
            className={styles["primary-button"]}
            onClick={handleToggleModalVisibility}
            disabled={isStorageFull}
            title={isStorageFull ? "Лимит хранилища исчерпан" : undefined}
          >
            Загрузить файл
          </button>
        </div>

        {data && (
          <StorageUsageBar
            usedBytes={data.usedBytes}
            limitBytes={data.limitBytes}
          />
        )}

        <FilesList />
      </div>

      <FileUploadModal
        isOpen={isOpen}
        onClose={handleToggleModalVisibility}
        usedBytes={data?.usedBytes ?? 0}
        limitBytes={data?.limitBytes ?? 0}
      />
    </>
  );
};
