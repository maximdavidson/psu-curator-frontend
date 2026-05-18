import type { IMenuItem } from "./navigation.types";
import CalendarIcon from "../../assets/calendar.svg";
import HomeIcon from "../../assets/groups-icon.svg";
import TeachesrIcon from "../../assets/teachers-icon.svg";
import PoolsIcon from "../../assets/polls-icon.svg";
import DocumentsIcon from "../../assets/documents-icon.svg";
import ChatIcon from "../../assets/chat.svg";

export const menuData: IMenuItem[] = [
  {
    to: "/groups",
    label: "Группы факультета",
    icon: HomeIcon
  },
  {
    to: "/calendar",
    label: "Календарь",
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
    icon: PoolsIcon
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
