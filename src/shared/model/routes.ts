export const PAGE_ROUTES = {
  PUBLIC: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password/:token",
    NOT_FOUND: "/not-found"
  },
  PROTECTED: {
    GROUPS: "/groups",
    PROFILE: "/profile",
    SETTINGS: "/settings",
    LOGOUT: "/logout"
  }
} as const;
