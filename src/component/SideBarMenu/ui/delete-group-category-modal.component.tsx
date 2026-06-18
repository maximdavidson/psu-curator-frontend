import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./delete-group-category-modal.module.scss";
import type { GroupCategory } from "@/pages/groups/groupCategory.api";
import { readApiErrorMessage } from "@/shared/lib/read-api-error-message";

interface Props {
  category: GroupCategory | null;
  onClose: () => void;
  onConfirm: (categoryId: string) => Promise<void>;
}

function formatGroupsPhrase(count: number): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) {
    return `все ${count} групп`;
  }
  if (n1 === 1) {
    return `все ${count} группу`;
  }
  if (n1 > 1 && n1 < 5) {
    return `все ${count} группы`;
  }
  return `все ${count} групп`;
}

export const DeleteGroupCategoryModal = ({
  category,
  onClose,
  onConfirm
}: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!category) {
    return null;
  }

  const hasGroups = category.groupsCount > 0;

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(category.id);
      onClose();
    } catch (submitError) {
      setError(
        readApiErrorMessage(submitError) ?? "Не удалось удалить раздел групп."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <h2 className={styles.title}>Удалить раздел</h2>

        <div className={styles.body}>
          <p className={styles.message}>
            {hasGroups ? (
              <>
                Вы действительно хотите удалить раздел{" "}
                <strong>«{category.name}»</strong>? Будут безвозвратно удалены{" "}
                {formatGroupsPhrase(category.groupsCount)} в этом разделе, а
                участники будут откреплены от этих групп.
              </>
            ) : (
              <>
                Вы действительно хотите удалить пустой раздел{" "}
                <strong>«{category.name}»</strong>?
              </>
            )}
          </p>
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Удаление…" : "Удалить"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
