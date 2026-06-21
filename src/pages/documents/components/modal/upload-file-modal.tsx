import React, {
  useState,
  useRef,
  type DragEvent,
  type ChangeEvent
} from "react";
import styles from "./upload-file-modal.module.scss";
import { useUploadFileMutation } from "../../documents.api";
import { formatSize } from "../../model/format-size";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";

interface IFileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  usedBytes: number;
  limitBytes: number;
}

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf", "doc", "docx", "txt"];

export const FileUploadModal = ({
  isOpen,
  onClose,
  usedBytes,
  limitBytes
}: IFileUploadModalProps) => {
  const [isOver, setIsOver] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadFile] = useUploadFileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const remainingBytes = Math.max(0, limitBytes - usedBytes);

  const resetState = () => {
    setError(null);
    setIsOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const isValidFile = (file: File): boolean => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    return extension ? ALLOWED_EXTENSIONS.includes(extension) : false;
  };

  const saveFiles = async (fileList: FileList | null): Promise<void> => {
    if (!fileList) return;

    const fileArray = Array.from(fileList);
    const validFiles = fileArray.filter(isValidFile);
    const invalidFiles = fileArray.filter((file) => !isValidFile(file));

    if (invalidFiles.length > 0) {
      setError("Такой формат не поддерживается!");
    } else {
      setError(null);
    }

    if (validFiles.length === 0) return;

    const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > remainingBytes) {
      setError(
        `Недостаточно места. Доступно ${formatSize(remainingBytes)}, выбрано ${formatSize(totalSize)}.`
      );
      return;
    }

    try {
      await Promise.all(
        validFiles.map((file) => uploadFile({ file }).unwrap())
      );
      handleClose();
    } catch (uploadError) {
      setError(readApiErrorMessage(uploadError) ?? "Ошибка при загрузке файла");
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
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={styles.modal}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <h2>Загрузить файлы</h2>

        <p className={styles.hint}>
          Поддерживаемые форматы: JPG, JPEG, PNG, PDF, DOC, DOCX, TXT
        </p>
        <p className={styles.hint}>
          Свободно: {formatSize(remainingBytes)} из {formatSize(limitBytes)}
        </p>

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
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
            style={{ display: "none" }}
            onChange={handleInputChange}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.closeBtn} onClick={handleClose}>
          Отмена
        </button>
      </div>
    </div>
  );
};
