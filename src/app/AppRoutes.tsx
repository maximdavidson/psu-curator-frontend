import { createBrowserRouter, Navigate } from "react-router-dom";
import { CommonProvider } from "./providers/CommonProvider";
import { LoginationPage } from "@/pages/login";
import { RegistrationPage } from "@/pages/registration";
import { GroupsPage } from "@/pages/groups";
import { ProtectedRoutes } from "./ProtectedRoutes";

export const router = createBrowserRouter([
  {
    element: <CommonProvider />,
    children: [
      {
        path: "/",
        element: <Navigate to="/register" />
      },
      {
        path: "/login",
        element: <LoginationPage />
      },
      {
        path: "/register",
        element: <RegistrationPage />
      },
      {
        element: <ProtectedRoutes roles={["admin"]} />,
        children: [
          {
            path: "/groups",
            element: <GroupsPage />
          }
        ]
      }
    ]
  }
]);
