import { Navigate } from 'react-router-dom';

import { useAuth } from './AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, logout, user } = useAuth();

  if (loading) {
    return (
      <div className="page-center">
        <div className="loader-card">Oturum kontrol ediliyor...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="page-center">
        <div className="access-card">
          <h1>Bu panele erişim yetkiniz yok</h1>
          <p>SafeWorker dashboard yalnızca admin rolündeki kullanıcılar içindir.</p>
          <button className="button" type="button" onClick={logout}>
            Çıkış Yap
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
