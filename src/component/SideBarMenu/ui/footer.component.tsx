import { LogoutButton } from "./logout-button.component";
import { NavigationItem } from "./navigation-item.component";
import SettingIcon from "@/assets/settings-icon.svg";
import styles from "../side-bar-menu.module.scss";
interface IFooterProps {
  pathname: string;
}

export const Footer = ({ pathname }: IFooterProps) => {
  return (
    <footer className={styles["sidebar-menu__footer"]}>
      <ul>
        <NavigationItem
          label={"Настройки"}
          to={"/settings"}
          icon={SettingIcon}
          isActive={pathname === "/settings"}
        />
        <LogoutButton />
      </ul>
    </footer>
  );
};
