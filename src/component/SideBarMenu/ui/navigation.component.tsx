import { menuData } from "../navigation-data";
import { NavigationItem } from "./navigation-item.component";
import styles from "../side-bar-menu.module.scss";
interface INavigationProps {
  pathname: string;
}

export const Navigation = ({ pathname }: INavigationProps) => {
  return (
    <nav>
      <ul className={styles["sidebar-menu__navigation"]}>
        {menuData.map((item, index) => (
          <NavigationItem
            {...item}
            isActive={pathname.includes(item.to)}
            key={index}
          />
        ))}
      </ul>
    </nav>
  );
};
