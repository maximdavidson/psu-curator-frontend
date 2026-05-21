import { useLazyDownloadFileQuery } from "@/pages/documents/documents.api";
import { formatFileSize, getFileIcon } from "@/shared/lib/file-display";
import type { ChatAttachment } from "@/services/chat.api";
import styles from "../chat.module.scss";

interface ChatMessageAttachmentsProps {
  attachments: ChatAttachment[];
}

export const ChatMessageAttachments = ({
  attachments
}: ChatMessageAttachmentsProps) => {
  const [downloadFile] = useLazyDownloadFileQuery();

  const handleDownload = async (attachment: ChatAttachment) => {
    try {
      const blob = await downloadFile(attachment.id).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(attachment.downloadUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className={styles.messageAttachments}>
      {attachments.map((attachment) => (
        <button
          key={attachment.id}
          type="button"
          className={styles.messageAttachment}
          onClick={() => void handleDownload(attachment)}
          title={`Скачать ${attachment.fileName}`}
        >
          <span className={styles.messageAttachmentIcon}>
            {getFileIcon(attachment.contentType)}
          </span>
          <span className={styles.messageAttachmentInfo}>
            <span className={styles.messageAttachmentName}>
              {attachment.fileName}
            </span>
            <span className={styles.messageAttachmentSize}>
              {formatFileSize(attachment.fileSize)}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
};
