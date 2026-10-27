import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Clock, ShieldCheck, User } from 'lucide-react';

const Navbar = ({ title = 'StaffSync Portal' }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="top-navbar">
      <div className="d-flex align-items-center gap-3">
        <h4 className="mb-0 fw-bold text-dark" style={{ letterSpacing: '-0.3px' }}>
          {title}
        </h4>
        <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill d-none d-md-inline-block">
          {user?.department || 'Operations'}
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Real-time Clock display */}
        <div className="d-none d-lg-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill border text-muted">
          <Clock size={16} className="text-primary" />
          <span className="fw-semibold text-dark" style={{ fontSize: '0.86rem' }}>
            {formattedDate}
          </span>
          <span className="text-secondary" style={{ fontSize: '0.86rem' }}>
            • {formattedTime}
          </span>
        </div>

        {/* Current User Pill */}
        <div className="d-flex align-items-center gap-2 ps-2 border-start">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '38px', height: '38px' }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="d-none d-sm-block text-start">
            <div className="fw-bold text-dark" style={{ fontSize: '0.88rem', lineHeight: '1.2' }}>
              {user?.name || 'Staff User'}
            </div>
            <div className="text-muted text-capitalize" style={{ fontSize: '0.75rem' }}>
              {user?.role === 'hr' ? 'HR Administrator' : user?.role || 'Staff Member'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
