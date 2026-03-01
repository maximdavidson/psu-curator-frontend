import { createBrowserRouter, Navigate } from "react-router-dom";
import { CommonProvider } from "./providers/CommonProvider";
import { LoginationPage } from "@/pages/login";
import { RegistrationPage } from "@/pages/registration";
import { GroupsPage } from "@/pages/groups";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { DynamicPlaceholder } from "@/component/Placeholder/DynamicPlayceholder";
import { AppLayout } from "./AppLoyout";
import { SurveysPage } from "@/pages/surveys/surveys.component";

export const router = createBrowserRouter([
  {
    element: <CommonProvider />,
    children: [
      {
        path: "/login",
        element: <LoginationPage />
      },
      {
        path: "/register",
        element: <RegistrationPage />
      },
      {
        path: "/",
        element: <Navigate to="/register" />
      },
      {
        element: <AppLayout />,
        children: [
          {
            element: <ProtectedRoutes roles={["admin"]} />,
            children: [
              {
                path: "/groups",
                element: <GroupsPage />
              },
              {
                path: "/surveys",
                element: <SurveysPage />
              }
            ]
          },
          {
            path: "*",
            element: <DynamicPlaceholder />
          }
        ]
      }
    ]
  }
]);
