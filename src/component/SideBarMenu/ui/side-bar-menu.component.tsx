import { useLocation } from "react-router-dom";
import { Footer } from "./footer.component";
import { Navigation } from "./navigation.component";
import styles from "../side-bar-menu.module.scss";

export const SideBarMenu = () => {
  const { pathname } = useLocation();

  return (
    <div className={styles["sidebar-menu"]}>
      <Navigation pathname={pathname} />
      <Footer pathname={pathname} />
    </div>
  );
};
