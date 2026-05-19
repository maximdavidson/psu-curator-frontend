import { Outlet } from "react-router-dom";
import { Header } from "../Header";
import styles from "./base-layout.module.scss";
import { SideBarMenu } from "../SideBarMenu";
export const BaseLayout = () => {
  return (
    <div className={styles["base-layout"]}>
      <Header />
      <SideBarMenu />
      <main className={styles["main"]}>
        <Outlet />
      </main>
    </div>
  );
};
