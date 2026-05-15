import { useEffect, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { selectThemeMode, THEME_STORAGE_KEY } from "@/stores/theme.store";

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const mode = useSelector(selectThemeMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  return children;
};
