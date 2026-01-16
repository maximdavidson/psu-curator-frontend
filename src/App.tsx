import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RegistrationPage } from "./pages/registration";
import { LoginationPage } from "./pages/registration";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/register" />} />
          <Route path="/login" element={<LoginationPage />} />
          <Route path="/register" element={<RegistrationPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
