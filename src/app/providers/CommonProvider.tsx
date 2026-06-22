import { Outlet } from "react-router-dom";
import { StoreProvider } from "./StoreProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ConfirmDialogProvider } from "@/shared/ui/confirm-dialog";

export const CommonProvider = () => {
  return (
    <StoreProvider>
      <ThemeProvider>
        <ConfirmDialogProvider>
          <Outlet />
        </ConfirmDialogProvider>
      </ThemeProvider>
    </StoreProvider>
  );
};
