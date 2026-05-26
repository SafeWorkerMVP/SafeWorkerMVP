import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './auth/ProtectedRoute.jsx';
import Layout from './layout/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LiveWorkersPage from './pages/LiveWorkersPage.jsx';
import AlarmsPage from './pages/AlarmsPage.jsx';
import RiskChartPage from './pages/RiskChartPage.jsx';
import ZonesPage from './pages/ZonesPage.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="live-workers" element={<LiveWorkersPage />} />
        <Route path="alarms" element={<AlarmsPage />} />
        <Route path="risk-chart" element={<RiskChartPage />} />
        <Route path="zones" element={<ZonesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
