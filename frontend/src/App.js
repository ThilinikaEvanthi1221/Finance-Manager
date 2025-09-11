import React, { useState } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./pages/Dashboard";
import Footer from "./components/Footer";
import LandingPage from "./pages/Landingpage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

// Layout wrapper for footer
function AppLayoutWithFooter() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(false);

  return (
    <Routes>
      {/* Routes WITHOUT footer */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login setAuth={setAuth} />} />
      <Route path="/register" element={<Register setAuth={setAuth} />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Routes WITH footer */}
      <Route element={<AppLayoutWithFooter />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* more routes */}
      </Route>
    </Routes>
  );
}