import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RegistrationPage } from "./component";
import { LoginationPage } from "./component";

export default function AppRouter() {
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
