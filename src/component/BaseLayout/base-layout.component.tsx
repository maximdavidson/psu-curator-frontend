import { Outlet } from "react-router-dom";
import { Header } from "../Header";
import { SideMenuBar } from "../SideBarMenu";
import styles from "./base-layout.module.scss";

export const BaseLayout = () => {
  return (
    <div className={styles["base-layout"]}>
      <Header />
      <SideMenuBar />
      <main className={styles["main"]}>
        <Outlet />
      </main>
    </div>
  );
};
