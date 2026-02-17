import { Placeholder } from "./Placeholder";

export const DynamicPlaceholder = () => {
  const path = window.location.pathname;
  return <Placeholder page={path} />;
};
