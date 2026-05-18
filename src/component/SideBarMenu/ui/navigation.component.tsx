import { menuData } from "../navigation-data";
import { NavigationItem } from "./navigation-item.component";
import styles from "../side-bar-menu.module.scss";
import { getRoleStringFromAccessToken } from "@/shared/lib/jwt-claims";
import { useGetDialogsQuery } from "@/services/chat.api";

interface INavigationProps {
  pathname: string;
  isCollapsed: boolean;
}

export const Navigation = ({ pathname, isCollapsed }: INavigationProps) => {
  const token = localStorage.getItem("token");
  const role = getRoleStringFromAccessToken(token);
  const { data: dialogs = [] } = useGetDialogsQuery(undefined, {
    skip: !token
  });
  const unreadMessagesCount = dialogs.reduce(
    (total, dialog) => total + dialog.unreadCount,
    0
  );
  const visibleMenu = menuData.filter(
    (item) => !item.visibleTo || (role && item.visibleTo.includes(role))
  );

  return (
    <nav>
      <ul className={styles["sidebar-menu__navigation"]}>
        {visibleMenu.map((item, index) => (
          <NavigationItem
            {...item}
            isActive={pathname === item.to}
            badgeCount={item.to === "/chat" ? unreadMessagesCount : undefined}
            isCollapsed={isCollapsed}
            key={index}
          />
        ))}
      </ul>
    </nav>
  );
};
