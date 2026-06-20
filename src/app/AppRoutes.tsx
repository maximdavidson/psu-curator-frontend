import { createBrowserRouter, Navigate } from "react-router-dom";
import { CommonProvider } from "./providers/CommonProvider";
import { LoginationPage } from "@/pages/login";

import { StudentRegisterPage } from "@/pages/student-register";
import { STUDENT_REGISTER_PAGE_ROLES } from "@/shared/lib/jwt-claims";
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
import { ForceChangePasswordPage } from "@/pages/force-change-password/force-change-password.page";
import { ForgotPasswordPage } from "@/pages/forgot-password";
import { EventTypesPage } from "@/pages/event-types/event-types.page";
import { SURVEYS_LIST_PAGE_ROLES } from "@/shared/lib/jwt-claims";
export const router = createBrowserRouter([
  {
    element: <CommonProvider />,
    children: [
      {
        element: <PublicRoutes />,
        children: [
          {
            path: "/",
            element: <Navigate to="/login" />
          },
          {
            path: "/login",
            element: <LoginationPage />
          },
          {
            path: "/forgot-password",
            element: <ForgotPasswordPage />
          },
          {
            path: "/reset-password",
            element: <Navigate to="/forgot-password" replace />
          },
          {
            path: "/register",
            element: <Navigate to="/login" replace />
          }
        ]
      },
      {
        path: "/",
        element: <Navigate to="/login" />
      },
      {
        path: "/force-change-password",
        element: <ProtectedRoutes />,
        children: [
          {
            index: true,
            element: <ForceChangePasswordPage />
          }
        ]
      },
      {
        element: <AppLayout />,
        children: [
          {
            element: <ProtectedRoutes />,
            children: [
              {
                path: "/groups",
                element: <GroupsPage />
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
                path: "/event-types",
                element: <EventTypesPage />
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
                  <ProtectedRoutes allowedRoles={SURVEYS_LIST_PAGE_ROLES} />
                ),
                children: [
                  {
                    path: "/surveys",
                    element: <SurveysPage />
                  }
                ]
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
              },
              {
                element: (
                  <ProtectedRoutes
                    allowedRoles={[...STUDENT_REGISTER_PAGE_ROLES]}
                  />
                ),
                children: [
                  {
                    path: "/students/register",
                    element: <StudentRegisterPage />
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
