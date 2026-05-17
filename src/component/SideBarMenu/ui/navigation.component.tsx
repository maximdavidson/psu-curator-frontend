import { menuData } from "../navigation-data";
import { NavigationItem } from "./navigation-item.component";
import styles from "../side-bar-menu.module.scss";
import { getRoleStringFromAccessToken } from "@/shared/lib/jwt-claims";
interface INavigationProps {
  pathname: string;
}

export const Navigation = ({ pathname }: INavigationProps) => {
  const role = getRoleStringFromAccessToken(localStorage.getItem("token"));
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
            key={index}
          />
        ))}
      </ul>
    </nav>
  );
};
