import React, {
  useState,
  useRef,
  type DragEvent,
  type ChangeEvent
} from "react";
import styles from "./upload-file-modal.module.scss";
import { db } from "../../model/db";

interface IFileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileUploadModal = ({ isOpen, onClose }: IFileUploadModalProps) => {
  const [isOver, setIsOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const saveFiles = async (fileList: FileList | null): Promise<void> => {
    if (!fileList) return;

    const fileArray = Array.from(fileList);

    try {
      const uploadPromises = fileArray.map((file) => {
        return db.files.add({
          name: file.name,
          type: file.type,
          size: file.size,
          content: file,
          createdAt: Date.now()
        });
      });

      await Promise.all(uploadPromises);
      onClose();
    } catch (error) {
      console.error("Ошибка при сохранении файлов:", error);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      saveFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    saveFiles(e.target.files);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <h2>Загрузить файлы</h2>

        <div
          className={`${styles.dropZone} ${isOver ? styles.isOver : ""}`}
          onDragOver={(e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsOver(true);
          }}
          onDragLeave={() => setIsOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <p>Перетащите файлы сюда или</p>
          <span className={styles.uploadButton}>Выберите на компьютере</span>

          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleInputChange}
          />
        </div>

        <button className={styles.closeBtn} onClick={onClose}>
          Отмена
        </button>
      </div>
    </div>
  );
};
