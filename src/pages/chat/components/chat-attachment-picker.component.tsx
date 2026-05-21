import { useMemo, useState } from "react";
import {
  useGetUserFilesQuery,
  type IFileResponse
} from "@/pages/documents/documents.api";
import { formatFileSize, getFileIcon } from "@/shared/lib/file-display";
import styles from "../chat.module.scss";

export type PendingLocalAttachment = {
  kind: "local";
  id: string;
  file: File;
};

export type PendingLibraryAttachment = {
  kind: "library";
  file: IFileResponse;
};

export type PendingAttachment =
  | PendingLocalAttachment
  | PendingLibraryAttachment;

interface ChatAttachmentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  pendingAttachments: PendingAttachment[];
  onChange: (attachments: PendingAttachment[]) => void;
}

const createLocalId = (): string =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const ChatAttachmentPicker = ({
  isOpen,
  onClose,
  pendingAttachments,
  onChange
}: ChatAttachmentPickerProps) => {
  const [tab, setTab] = useState<"device" | "library">("device");
  const { data: userFiles = [], isLoading: isFilesLoading } =
    useGetUserFilesQuery(undefined, { skip: !isOpen });

  const attachableLibraryFiles = useMemo(
    () =>
      userFiles.filter(
        (file) =>
          !pendingAttachments.some(
            (item) => item.kind === "library" && item.file.id === file.id
          )
      ),
    [pendingAttachments, userFiles]
  );

  if (!isOpen) {
    return null;
  }

  const handleDeviceFiles = (files: FileList | null) => {
    if (!files?.length) {
      return;
    }
    const next = [...pendingAttachments];
    for (const file of Array.from(files)) {
      next.push({ kind: "local", id: createLocalId(), file });
    }
    onChange(next);
  };

  const toggleLibraryFile = (file: IFileResponse) => {
    const exists = pendingAttachments.some(
      (item) => item.kind === "library" && item.file.id === file.id
    );
    if (exists) {
      onChange(
        pendingAttachments.filter(
          (item) => !(item.kind === "library" && item.file.id === file.id)
        )
      );
      return;
    }
    onChange([...pendingAttachments, { kind: "library", file }]);
  };

  const removePending = (item: PendingAttachment) => {
    if (item.kind === "local") {
      onChange(
        pendingAttachments.filter(
          (pending) => !(pending.kind === "local" && pending.id === item.id)
        )
      );
      return;
    }
    onChange(
      pendingAttachments.filter(
        (pending) =>
          !(pending.kind === "library" && pending.file.id === item.file.id)
      )
    );
  };

  return (
    <div className={styles.attachmentModalBackdrop} onMouseDown={onClose}>
      <div
        className={styles.attachmentModal}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-labelledby="chat-attachment-title"
      >
        <div className={styles.attachmentModalHeader}>
          <h3 id="chat-attachment-title">Прикрепить файлы</h3>
          <button type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>

        <div className={styles.attachmentTabs}>
          <button
            type="button"
            className={tab === "device" ? styles.attachmentTabActive : ""}
            onClick={() => setTab("device")}
          >
            С компьютера
          </button>
          <button
            type="button"
            className={tab === "library" ? styles.attachmentTabActive : ""}
            onClick={() => setTab("library")}
          >
            Из приложения
          </button>
        </div>

        {tab === "device" ? (
          <label className={styles.attachmentDevicePicker}>
            <span>Выберите файлы в проводнике</span>
            <input
              type="file"
              multiple
              onChange={(event) => {
                handleDeviceFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        ) : (
          <div className={styles.attachmentLibraryList}>
            {isFilesLoading && (
              <p className={styles.hint}>Загрузка файлов...</p>
            )}
            {!isFilesLoading && attachableLibraryFiles.length === 0 && (
              <p className={styles.hint}>
                В разделе «Документы» нет свободных файлов для прикрепления.
              </p>
            )}
            {attachableLibraryFiles.map((file) => {
              const isSelected = pendingAttachments.some(
                (item) => item.kind === "library" && item.file.id === file.id
              );
              return (
                <button
                  key={file.id}
                  type="button"
                  className={`${styles.attachmentLibraryItem} ${
                    isSelected ? styles.attachmentLibraryItemSelected : ""
                  }`}
                  onClick={() => toggleLibraryFile(file)}
                >
                  <span>{getFileIcon(file.contentType)}</span>
                  <span className={styles.attachmentLibraryItemText}>
                    <span>{file.fileName}</span>
                    <span>{formatFileSize(file.fileSize)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {pendingAttachments.length > 0 && (
          <div className={styles.pendingAttachments}>
            <p className={styles.pendingAttachmentsTitle}>Выбрано</p>
            {pendingAttachments.map((item) => (
              <div
                key={item.kind === "local" ? item.id : item.file.id}
                className={styles.pendingAttachmentChip}
              >
                <span>
                  {item.kind === "local" ? item.file.name : item.file.fileName}
                </span>
                <button
                  type="button"
                  onClick={() => removePending(item)}
                  aria-label="Убрать файл"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className={styles.attachmentModalDone}
          onClick={onClose}
        >
          Готово
        </button>
      </div>
    </div>
  );
};
