import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, ShieldAlert, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await register(formData);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      }}
    >
      <div className="card shadow-lg border-0 my-4" style={{ maxWidth: '540px', width: '100%', borderRadius: '20px' }}>
        <div className="card-body p-4 p-sm-5">
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-4 text-white shadow mb-3"
              style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)',
                fontSize: '1.8rem',
              }}
            >
              ⚡
            </div>
            <h3 className="fw-bold text-dark mb-1">Create Account</h3>
            <p className="text-secondary small mb-0">Join your organization on StaffSync</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-4" role="alert">
              <ShieldAlert size={18} className="flex-shrink-0" />
              <div className="small">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold small text-secondary">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control rounded-3"
                  placeholder="e.g. Jordan Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small text-secondary">Work Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control rounded-3"
                  placeholder="jordan.smith@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold small text-secondary">Password (min 6 characters)</label>
                <input
                  type="password"
                  name="password"
                  className="form-control rounded-3"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-secondary">Role</label>
                <select
                  name="role"
                  className="form-select rounded-3"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR Administrator</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-secondary">Department</label>
                <select
                  name="department"
                  className="form-select rounded-3"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Design">Design</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-secondary">Job Title / Designation</label>
                <input
                  type="text"
                  name="designation"
                  className="form-control rounded-3"
                  placeholder="e.g. Frontend Developer"
                  value={formData.designation}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small text-secondary">Contact Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control rounded-3"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg w-100 rounded-3 mt-4 d-flex align-items-center justify-content-center gap-2"
            >
              {isSubmitting ? (
                <div className="spinner-border spinner-border-sm" role="status"></div>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted small">Already have an account? </span>
            <Link to="/login" className="text-primary fw-semibold small text-decoration-none">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
