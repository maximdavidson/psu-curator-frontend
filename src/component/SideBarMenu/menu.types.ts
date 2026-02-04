import type { FC } from "react";

export interface IMenuItem {
  label: string;
  to: string;
  icon: FC<React.SVGProps<SVGSVGElement>>;
}
