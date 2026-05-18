import { createBrowserRouter, Navigate } from "react-router-dom";
import { CommonProvider } from "./providers/CommonProvider";
import { LoginationPage } from "@/pages/login";
import { RegistrationPage } from "@/pages/registration";
import { GroupsPage } from "@/pages/groups";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { DynamicPlaceholder } from "@/component/Placeholder/DynamicPlayceholder";
import { PublicRoutes } from "./PublicRoutes";
import { AppLayout } from "./AppLoyout";
import { SurveysPage } from "@/pages/surveys/surveys.component";
import { DocumentsPage } from "@/pages/documents/";
import { CalendarPage } from "@/pages/calendar/calendar.component";
import { GroupDetailPage } from "@/pages/group-detail/group-detail.page";
import { SettingsPage } from "@/pages/settings";
import { UserManagementPage } from "@/pages/user-management/user-management.page";
import { ChatPage } from "@/pages/chat/chat.page";

export const router = createBrowserRouter([
  {
    element: <CommonProvider />,
    children: [
      {
        element: <PublicRoutes />,
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
          }
        ]
      },
      {
        path: "/",
        element: <Navigate to="/register" />
      },
      {
        element: <AppLayout />,
        children: [
          {
            //roles={["admin"]}
            element: <ProtectedRoutes />,
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
              },
              {
                path: "/calendar",
                element: <CalendarPage />
              },
              {
                path: "/chat",
                element: <ChatPage />
              },
              {
                path: "/groups/:groupId",
                element: <GroupDetailPage />
              },
              {
                path: "/settings",
                element: <SettingsPage />
              },
              {
                element: (
                  <ProtectedRoutes
                    allowedRoles={["Dean", "DeputyDean", "Admin"]}
                  />
                ),
                children: [
                  {
                    path: "/users",
                    element: <UserManagementPage />
                  }
                ]
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
