import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  GraduationCap,
  Megaphone,
  UserCheck,
  LogOut,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'hr':
      case 'admin':
        return <span className="badge badge-role-hr px-2 py-1 rounded-pill">HR Admin</span>;
      case 'manager':
        return <span className="badge badge-role-manager px-2 py-1 rounded-pill">Team Lead</span>;
      default:
        return <span className="badge badge-role-employee px-2 py-1 rounded-pill">Employee</span>;
    }
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center gap-2">
        <div
          className="d-flex align-items-center justify-content-center rounded-3 text-white fw-bold shadow-sm"
          style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)' }}
        >
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
        </div>
        <div>
          <h5 className="mb-0 fw-bold text-white tracking-wide" style={{ letterSpacing: '-0.5px' }}>
            StaffSync
          </h5>
          <small className="text-muted" style={{ fontSize: '0.72rem' }}>
            Modern HR Solution
          </small>
        </div>
      </div>

      {/* User Info Capsule */}
      <div className="p-3 mx-2 my-2 rounded-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <div className="d-flex align-items-center gap-2 mb-1">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
            style={{ width: '36px', height: '36px', backgroundColor: '#3b82f6', fontSize: '0.9rem' }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="fw-semibold text-white text-truncate" style={{ fontSize: '0.9rem' }}>
              {user?.name || 'Staff Member'}
            </div>
            <div className="text-secondary text-truncate" style={{ fontSize: '0.75rem' }}>
              {user?.designation || user?.department}
            </div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
          {getRoleBadge(user?.role)}
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
            {user?.employeeId || 'EMP'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow-1 px-2 py-3 overflow-y-auto">
        <div className="text-uppercase text-secondary px-3 mb-2" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}>
          Main Navigation
        </div>

        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/employees" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Users size={19} />
          <span>Employee Directory</span>
        </NavLink>

        <NavLink to="/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Clock size={19} />
          <span>Attendance & Clock</span>
        </NavLink>

        <NavLink to="/leaves" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <CalendarDays size={19} />
          <span>Leave Management</span>
        </NavLink>

        <NavLink to="/training" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <GraduationCap size={19} />
          <span>Training & Growth</span>
        </NavLink>

        <NavLink to="/announcements" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Megaphone size={19} />
          <span>Announcements</span>
        </NavLink>

        <div className="text-uppercase text-secondary px-3 mt-4 mb-2" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em' }}>
          Account
        </div>

        <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <UserCheck size={19} />
          <span>My Profile</span>
        </NavLink>
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-top border-secondary border-opacity-25">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
          style={{ borderRadius: '8px', fontSize: '0.88rem' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
