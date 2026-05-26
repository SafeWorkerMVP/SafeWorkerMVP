import { NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/live-workers', label: 'Canlı Çalışanlar' },
  { to: '/alarms', label: 'Alarmlar' },
  { to: '/risk-chart', label: 'Risk Grafiği' },
  { to: '/zones', label: 'Bölgeler' }
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">SW</div>
        <div>
          <h1>SafeWorker</h1>
          <p>İSG Dashboard</p>
        </div>
      </div>

      <nav className="nav-links" aria-label="Dashboard menüsü">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-box">
          <strong>{user?.name || 'Admin'}</strong>
          <span>{user?.email}</span>
        </div>
        <button className="button button-secondary full-width" type="button" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
