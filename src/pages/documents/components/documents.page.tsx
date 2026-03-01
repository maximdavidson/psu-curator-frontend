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
        <button
          className={styles["upload-file-button"]}
          onClick={handleToggleModalVisibility}
        >
          Загрузить файл
        </button>
        <FilesList />
      </div>
      <FileUploadModal isOpen={isOpen} onClose={handleToggleModalVisibility} />
    </>
  );
};
