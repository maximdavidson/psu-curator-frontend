import type { IMenuItem } from "./menu.types";
import GroupsIcon from "../../assets/groups-icon.svg?react";

export const menuData: IMenuItem[] = [
  {
    to: "/groups",
    label: "Группы факультета",
    icon: GroupsIcon
  },
  {
    to: "/about",
    label: "Расписание",
    icon: GroupsIcon
  },
  {
    to: "/teachers",
    label: "Преподаватели",
    icon: GroupsIcon
  }
];
