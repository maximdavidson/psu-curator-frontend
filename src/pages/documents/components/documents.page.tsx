import { useState } from "react";
import { FileUploadModal } from "./modal/upload-file-modal";
import styles from "./documets.module.scss";
import { FilesList } from "./list/FilesList";
export const DocumentsPage = () => {
  const [isOpen, setIsOpen] = useState(false);
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
          >
            Загрузить файл
          </button>
        </div>

        <FilesList />
      </div>

      <FileUploadModal isOpen={isOpen} onClose={handleToggleModalVisibility} />
    </>
  );
};
