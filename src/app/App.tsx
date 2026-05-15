import { RouterProvider } from "react-router-dom";
import "./App.css";
import "@/styles/theme.css";
import "@/styles/theme-utilities.css";
import { router } from "./AppRoutes";

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
