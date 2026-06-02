import type { IMenuItem } from "./navigation.types";
import CalendarIcon from "../../assets/calendar.svg";
import HomeIcon from "../../assets/groups-icon.svg";
import TeachesrIcon from "../../assets/teachers-icon.svg";
import PoolsIcon from "../../assets/polls-icon.svg";
import DocumentsIcon from "../../assets/documents-icon.svg";
import ChatIcon from "../../assets/chat.svg";
import {
  STUDENT_REGISTER_PAGE_ROLES,
  SURVEYS_LIST_PAGE_ROLES
} from "@/shared/lib/jwt-claims";
export const menuData: IMenuItem[] = [
  {
    to: "/groups",
    label: "Группы факультета",
    icon: HomeIcon
  },
  {
    to: "/students/register",
    label: "Студенты",
    icon: TeachesrIcon,
    visibleTo: [...STUDENT_REGISTER_PAGE_ROLES]
  },
  {
    to: "/calendar",
    label: "Календарь",
    icon: CalendarIcon
  },
  {
    to: "/event-types",
    label: "Типы событий",
    icon: CalendarIcon
  },
  {
    to: "/chat",
    label: "Мессенджер",
    icon: ChatIcon
  },
  {
    to: "/surveys",
    label: "Опросы",
    icon: PoolsIcon,
    visibleTo: [...SURVEYS_LIST_PAGE_ROLES]
  },
  {
    to: "/documents",
    label: "Документы",
    icon: DocumentsIcon
  },
  {
    to: "/users",
    label: "Пользователи",
    icon: TeachesrIcon,
    visibleTo: ["Dean", "DeputyDean", "Admin"]
  }
];
