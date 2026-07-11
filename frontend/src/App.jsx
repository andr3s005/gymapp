import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useAuthStore } from "./store/authStore";
import { getMeRequest } from "./services/authService";
import ProtectedRoute from "./components/ProtectedRoute";
import { useThemeStore } from "./store/themeStore";
import Exercises from "./pages/Exercises";
import Routines from "./pages/Routines";
import Memberships from "./pages/Memberships";
import Coaches from "./pages/Coaches";
import Nutrition from "./pages/Nutrition";
import Sessions from "./pages/Sessions";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";

function App() {
  const [checkingSession, setCheckingSession] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const applyStoredTheme = useThemeStore((state) => state.applyStoredTheme);

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
    applyStoredTheme();
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
      <Route
        path="/exercises"
        element={
          <ProtectedRoute>
            <Exercises />
          </ProtectedRoute>
        }
      />
      <Route
        path="/routines"
        element={
          <ProtectedRoute>
            <Routines />
          </ProtectedRoute>
        }
      />
      <Route
        path="/memberships"
        element={
          <ProtectedRoute>
            <Memberships />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coaches"
        element={
          <ProtectedRoute>
            <Coaches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nutrition"
        element={
          <ProtectedRoute>
            <Nutrition />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <Sessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
