import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useAuthStore } from "./store/authStore";
import { getMeRequest } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [checkingSession, setCheckingSession] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    async function checkSession() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setCheckingSession(false);
        return;
      }

      try {
        const data = await getMeRequest();
        setUser(data.profile);
      } catch (err) {
        logout();
      } finally {
        setCheckingSession(false);
      }
    }

    checkSession();
  }, []);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-secondary font-body">Cargando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={<div className="text-white p-8">Home (próximamente)</div>}
      />
    </Routes>
  );
}

export default App;
