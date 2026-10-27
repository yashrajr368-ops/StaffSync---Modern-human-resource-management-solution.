import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Key,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await api.put('/auth/profile', profileForm);
      if (res.data.success) {
        setProfileSuccess('Profile details successfully updated!');
        updateUser(res.data.user);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.data.success) {
        setPasswordSuccess('Password successfully updated!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Error changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="main-content">
      <Navbar title="My Profile & Security" />

      <div className="p-4 overflow-y-auto">
        <div className="row g-4">
          {/* User Overview Capsule */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 mb-4 text-center">
              <div className="card-body p-4">
                <div
                  className="rounded-circle bg-primary text-white fs-1 fw-bold d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                  style={{ width: '80px', height: '80px' }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h5 className="fw-bold text-dark mb-1">{user?.name}</h5>
                <p className="text-secondary small mb-2">{user?.designation}</p>
                <div className="d-flex justify-content-center gap-2 mb-3">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                    {user?.department}
                  </span>
                  <span className="badge bg-light text-dark border">
                    {user?.employeeId || 'EMP'}
                  </span>
                </div>

                <div className="border-top pt-3 text-start small d-flex flex-column gap-2 text-muted">
                  <div className="d-flex align-items-center gap-2">
                    <Mail size={15} /> <span>{user?.email}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Phone size={15} /> <span>{user?.phone || 'Not set'}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <MapPin size={15} /> <span>{user?.address || 'Corporate Office'}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={15} />{' '}
                    <span>
                      Joined{' '}
                      {new Date(user?.dateOfJoining || user?.createdAt).toLocaleDateString([], {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Balance Snapshot */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold">Leave Allowances</div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2 small">
                  <span>Annual Paid Leave:</span>
                  <strong className="text-primary">{user?.leaveBalance?.annual ?? 15} Days</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span>Casual Allowance:</span>
                  <strong className="text-success">{user?.leaveBalance?.casual ?? 10} Days</strong>
                </div>
                <div className="d-flex justify-content-between small">
                  <span>Sick / Medical:</span>
                  <strong className="text-warning">{user?.leaveBalance?.sick ?? 8} Days</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Form Tabs: Edit Details & Change Password */}
          <div className="col-lg-8">
            {/* Update Profile Form */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white fw-bold">
                Edit Personal Contact Details
              </div>
              <div className="card-body p-4">
                {profileSuccess && (
                  <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                    <CheckCircle2 size={16} /> <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                    <AlertCircle size={16} /> <span>{profileError}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email (System Managed)</label>
                      <input
                        type="email"
                        className="form-control bg-light"
                        value={user?.email || ''}
                        disabled
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Residential Address</label>
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        placeholder="Street, City, Postal Code"
                        value={profileForm.address}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="btn btn-primary d-flex align-items-center gap-2 mt-4 rounded-3"
                  >
                    <Save size={16} />
                    <span>{profileLoading ? 'Saving...' : 'Update Information'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white fw-bold">
                Security & Password Management
              </div>
              <div className="card-body p-4">
                {passwordSuccess && (
                  <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                    <CheckCircle2 size={16} /> <span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                    <AlertCircle size={16} /> <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      className="form-control"
                      placeholder="••••••••"
                      required
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        className="form-control"
                        placeholder="••••••••"
                        minLength="6"
                        required
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        placeholder="••••••••"
                        minLength="6"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-3"
                  >
                    <Key size={16} />
                    <span>{passwordLoading ? 'Updating...' : 'Change Password'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
