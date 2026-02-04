import { useLocation } from "react-router-dom";
import { menuData } from "./menu-data";
import { MenuItem } from "./menu-item.component";

export const Menu = () => {
  const { pathname } = useLocation();

  return (
    <nav>
      <ul>
        {menuData.map((item, index) => (
          <MenuItem {...item} isActive={pathname === item.to} key={index} />
        ))}
      </ul>
    </nav>
  );
};
