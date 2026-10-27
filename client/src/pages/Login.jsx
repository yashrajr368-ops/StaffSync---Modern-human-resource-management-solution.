import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldAlert, Sparkles, User, Briefcase, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      }}
    >
      <div className="card shadow-lg border-0" style={{ maxWidth: '480px', width: '100%', borderRadius: '20px' }}>
        <div className="card-body p-4 p-sm-5">
          {/* Logo & Headline */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-4 text-white shadow mb-3"
              style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
                fontSize: '2rem',
              }}
            >
              ⚡
            </div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
              StaffSync
            </h3>
            <p className="text-secondary small mb-0">
              Modern Human Resource Management Solution
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-4" role="alert">
              <ShieldAlert size={18} className="flex-shrink-0" />
              <div className="small">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary">Work Email Address</label>
              <input
                type="email"
                className="form-control form-control-lg rounded-3 fs-6"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label fw-semibold small text-secondary mb-0">Password</label>
              </div>
              <input
                type="password"
                className="form-control form-control-lg rounded-3 fs-6"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg w-100 rounded-3 mb-4 d-flex align-items-center justify-content-center gap-2"
            >
              {isSubmitting ? (
                <div className="spinner-border spinner-border-sm" role="status"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In to Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Capsule */}
          <div className="pt-3 border-top">
            <div className="d-flex align-items-center gap-1 mb-2 text-secondary small fw-semibold">
              <Sparkles size={14} className="text-warning" />
              <span>1-Click Demo Accounts:</span>
            </div>
            <div className="d-grid gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('hr@staffsync.com', 'password123')}
                className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-start"
              >
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  <span className="fw-semibold">HR Admin (Eleanor)</span>
                </div>
                <small className="text-muted">hr@staffsync.com</small>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager.eng@staffsync.com', 'password123')}
                className="btn btn-sm btn-outline-info d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-start text-dark"
              >
                <div className="d-flex align-items-center gap-2">
                  <Briefcase size={16} className="text-info" />
                  <span className="fw-semibold">Manager (Marcus)</span>
                </div>
                <small className="text-muted">manager.eng@staffsync.com</small>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex.dev@staffsync.com', 'password123')}
                className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-start"
              >
                <div className="d-flex align-items-center gap-2">
                  <User size={16} className="text-success" />
                  <span className="fw-semibold">Employee (Alex)</span>
                </div>
                <small className="text-muted">alex.dev@staffsync.com</small>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center mt-4">
            <span className="text-muted small">New team member? </span>
            <Link to="/register" className="text-primary fw-semibold small text-decoration-none">
              Register account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
