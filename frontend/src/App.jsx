import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OwnerDashboard from "./pages/OwnerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/client-dashboard"
            element={
              <PrivateRoute allowedRoles={["client"]}>
                <ClientDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/owner-dashboard"
            element={
              <PrivateRoute allowedRoles={["owner"]}>
                <OwnerDashboard />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;