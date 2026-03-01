import { createBrowserRouter, Navigate } from "react-router-dom";
import { CommonProvider } from "./providers/CommonProvider";
import { LoginationPage } from "@/pages/login";
import { RegistrationPage } from "@/pages/registration";
import { GroupsPage } from "@/pages/groups";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { DynamicPlaceholder } from "@/component/Placeholder/DynamicPlayceholder";
import { AppLayout } from "./AppLoyout";
import { SurveysPage } from "@/pages/surveys/surveys.component";
import { DocumentsPage } from "@/pages/documents/";

export const router = createBrowserRouter([
  {
    element: <CommonProvider />,
    children: [
      {
        element: <AppLayout />,
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
              },
              {
                path: "/surveys",
                element: <SurveysPage />
              },
              {
                path: "/documents",
                element: <DocumentsPage />
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
