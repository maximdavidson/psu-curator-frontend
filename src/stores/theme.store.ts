import { STORE_NAMESPACE } from "@/shared/model/constants/store.namespace";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "psu-curator-theme";

interface ThemeState {
  mode: ThemeMode;
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

const initialState: ThemeState = {
  mode: readStoredTheme()
};

export const themeSlice = createSlice({
  name: STORE_NAMESPACE.THEME,
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
    },
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
    }
  }
});

export const selectThemeMode = (state: {
  [STORE_NAMESPACE.THEME]?: ThemeState;
}) => state[STORE_NAMESPACE.THEME]?.mode ?? "light";

export const selectIsDarkTheme = (state: {
  [STORE_NAMESPACE.THEME]?: ThemeState;
}) => selectThemeMode(state) === "dark";

export const { setTheme, toggleTheme } = themeSlice.actions;
