
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import AuthProvider from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CycleTracker from "./pages/CycleTracker.jsx";
import Wellness from "./pages/Wellness.jsx";
import AIAssistant from "./pages/AIAssistant.jsx";
import Reminders from "./pages/Reminders.jsx";
import Diet from "./pages/Diet.jsx";
import SelfCare from "./pages/SelfCare.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with shared sidebar */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cycle-tracker" element={<CycleTracker />} />
            <Route path="/wellness" element={<Wellness />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/diet" element={<Diet />} />
            <Route path="/self-care" element={<SelfCare />} />
            <Route path="/reminders" element={<Reminders />} />
          </Route>

          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
