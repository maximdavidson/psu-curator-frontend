import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { ConfirmDialog } from "./confirm-dialog.component";
import type {
  AlertDialogOptions,
  ConfirmDialogContextValue,
  ConfirmDialogOptions
} from "./confirm-dialog.types";

// eslint-disable-next-line react-refresh/only-export-components
export const ConfirmDialogContext =
  createContext<ConfirmDialogContextValue | null>(null);

type DialogMode = "confirm" | "alert";

interface DialogState {
  mode: DialogMode;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  variant: "danger" | "default";
}

function normalizeConfirmOptions(
  options: ConfirmDialogOptions | string
): ConfirmDialogOptions {
  return typeof options === "string" ? { message: options } : options;
}

function normalizeAlertOptions(
  options: AlertDialogOptions | string
): AlertDialogOptions {
  return typeof options === "string" ? { message: options } : options;
}

export const ConfirmDialogProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const closeDialog = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setDialog(null);
  }, []);

  const confirm = useCallback((options: ConfirmDialogOptions | string) => {
    const normalized = normalizeConfirmOptions(options);
    const variant = normalized.variant ?? "danger";

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        mode: "confirm",
        title: normalized.title ?? "Подтверждение",
        message: normalized.message,
        confirmLabel:
          normalized.confirmLabel ??
          (variant === "danger" ? "Удалить" : "Подтвердить"),
        cancelLabel: normalized.cancelLabel ?? "Отмена",
        variant
      });
    });
  }, []);

  const alert = useCallback((options: AlertDialogOptions | string) => {
    const normalized = normalizeAlertOptions(options);

    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve();
      setDialog({
        mode: "alert",
        title: normalized.title ?? "Сообщение",
        message: normalized.message,
        confirmLabel: normalized.confirmLabel ?? "Понятно",
        variant: "default"
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      confirm,
      alert
    }),
    [alert, confirm]
  );

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <ConfirmDialog
        isOpen={dialog !== null}
        title={dialog?.title ?? ""}
        message={dialog?.message ?? ""}
        confirmLabel={dialog?.confirmLabel ?? "ОК"}
        cancelLabel={
          dialog?.mode === "confirm" ? dialog.cancelLabel : undefined
        }
        variant={dialog?.variant ?? "default"}
        onConfirm={() => closeDialog(true)}
        onCancel={() => closeDialog(false)}
      />
    </ConfirmDialogContext.Provider>
  );
};
