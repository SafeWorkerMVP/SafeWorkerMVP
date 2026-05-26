import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext.jsx';

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@safeworker.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role !== 'admin') {
        setError('Bu panele erişim yetkiniz yok.');
        return;
      }

      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Giriş yapılamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-panel">
        <div className="login-copy">
          <div className="brand inline">
            <div className="brand-mark">SW</div>
            <div>
              <h1>SafeWorker</h1>
              <p>İSG Dashboard</p>
            </div>
          </div>
          <h2>Admin paneline giriş</h2>
          <p className="muted">Demo admin: admin@safeworker.com / 123456</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label htmlFor="password">
            Password
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="alert alert-error">{error}</div>}

          <button className="button full-width" type="submit" disabled={submitting}>
            {submitting ? 'Giriş yapılıyor' : 'Giriş Yap'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default LoginPage;
