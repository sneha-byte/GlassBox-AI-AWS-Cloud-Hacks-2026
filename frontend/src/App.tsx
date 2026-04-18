import { Navigate, Route, Routes } from "react-router-dom";

import { Dashboard } from "./pages/Dashboard";
import { AgentDetail } from "./pages/AgentDetail";

export default function App() {
  return (
    // Routing stays intentionally small: one dashboard, one detail view,
    // and a catch-all redirect so bad URLs recover gracefully.
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/agents/:agentId" element={<AgentDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
