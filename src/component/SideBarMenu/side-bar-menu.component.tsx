import { Navigation } from "./navigation.component";
import styles from "./side-bar-menu.module.scss";

export const SideBarMenu = () => {
  return (
    <div className={styles["sidebar-menu"]}>
      <Navigation />
    </div>
  );
};
