import type { IMenuItem } from "./menu.types";
import CalendarIcon from "../../assets/calendar.svg";
import HomeIcon from "../../assets/groups-icon.svg";
import TeachesrIcon from "../../assets/teachers-icon.svg";
import PoolsIcon from "../../assets/polls-icon.svg";
import DocumentsIcon from "../../assets/documents-icon.svg";

export const menuData: IMenuItem[] = [
  {
    to: "/groups",
    label: "Группы факультета",
    icon: HomeIcon
  },
  {
    to: "/about",
    label: "Расписание",
    icon: CalendarIcon
  },
  {
    to: "/teachers",
    label: "Преподаватели",
    icon: TeachesrIcon
  },
  {
    to: "/teachers",
    label: "Опросы",
    icon: PoolsIcon
  },
  {
    to: "/teachers",
    label: "Документы",
    icon: DocumentsIcon
  }
];
