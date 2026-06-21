import { Outlet } from "react-router-dom";
import { Header } from "@/component/Header";
import { SideBarMenu } from "@/component/SideBarMenu";
import { useSessionRefresh } from "@/hooks/use-session-refresh";
import styles from "./app-layout.module.scss";

export const AppLayout = () => {
  useSessionRefresh();

  return (
    <>
      <Header />
      <div className={styles.shell}>
        <SideBarMenu />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </>
  );
};
