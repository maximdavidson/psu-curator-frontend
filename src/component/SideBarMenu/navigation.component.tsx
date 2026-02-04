import { useLocation } from "react-router-dom";
import { menuData } from "./navigation-data";
import { NavigationItem } from "./navigation-item.component";

export const Navigation = () => {
  const { pathname } = useLocation();

  return (
    <nav>
      <ul>
        {menuData.map((item, index) => (
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
