import { Outlet } from "react-router-dom";
import { Header } from "@/component/Header";
import { SideBarMenu } from "@/component/SideBarMenu";

export const AppLayout = () => {
  return (
    <>
      <Header />
      <div style={{ display: "flex" }}>
        <SideBarMenu />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </>
  );
};
