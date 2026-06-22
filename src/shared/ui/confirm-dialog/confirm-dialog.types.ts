import type { ReactNode } from "react";

export type ConfirmDialogVariant = "danger" | "default";

export interface ConfirmDialogOptions {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
}

export interface AlertDialogOptions {
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
}

export interface ConfirmDialogContextValue {
  confirm: (options: ConfirmDialogOptions | string) => Promise<boolean>;
  alert: (options: AlertDialogOptions | string) => Promise<void>;
}
