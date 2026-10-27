import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Building,
  Edit2,
  Trash2,
  Eye,
  Shield,
  CheckCircle,
  X,
} from 'lucide-react';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    designation: 'Associate',
    phone: '',
    salary: 60000,
    address: '',
    status: 'Active',
  });

  const isHR = user?.role === 'hr' || user?.role === 'admin';

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (department !== 'All') params.department = department;
      if (roleFilter !== 'All') params.role = roleFilter;

      const res = await api.get('/employees', { params });
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, department, roleFilter]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await api.post('/employees', formData);
      if (res.data.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          password: 'password123',
          role: 'employee',
          department: 'Engineering',
          designation: 'Associate',
          phone: '',
          salary: 60000,
          address: '',
          status: 'Active',
        });
        fetchEmployees();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error creating employee');
    }
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name || '',
      email: emp.email || '',
      role: emp.role || 'employee',
      department: emp.department || 'Engineering',
      designation: emp.designation || '',
      phone: emp.phone || '',
      salary: emp.salary || 60000,
      address: emp.address || '',
      status: emp.status || 'Active',
    });
    setModalError('');
    setShowEditModal(true);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await api.put(`/employees/${selectedEmployee._id}`, formData);
      if (res.data.success) {
        setShowEditModal(false);
        fetchEmployees();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error updating employee');
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from StaffSync?`)) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting employee');
      }
    }
  };

  const handleOpenView = (emp) => {
    setSelectedEmployee(emp);
    setShowViewModal(true);
  };

  return (
    <div className="main-content">
      <Navbar title="Employee Directory" />

      <div className="p-4 overflow-y-auto">
        {/* Header Action Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-1">Company Workforce Directory</h4>
            <p className="text-secondary small mb-0">
              Browse, filter, and manage staff members across all departments.
            </p>
          </div>

          {isHR && (
            <button
              onClick={() => {
                setModalError('');
                setShowAddModal(true);
              }}
              className="btn btn-primary d-flex align-items-center gap-2 rounded-3"
            >
              <Plus size={18} />
              <span>Add New Employee</span>
            </button>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={18} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by name, ID, email, or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <select
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Design">Design</option>
                </select>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option value="hr">HR Admins</option>
                  <option value="manager">Managers</option>
                  <option value="employee">Employees</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="text-muted small mt-2">Loading directory...</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Role & Dept</th>
                      <th>Contact Details</th>
                      <th>Status</th>
                      {isHR && <th>Salary</th>}
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees && employees.length > 0 ? (
                      employees.map((emp) => (
                        <tr key={emp._id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px' }}
                              >
                                {emp.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-bold text-dark">{emp.name}</div>
                                <small className="text-muted">{emp.employeeId || 'EMP'}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{emp.designation || 'Staff'}</div>
                            <span className="badge bg-light text-secondary border">
                              {emp.department}
                            </span>
                          </td>
                          <td>
                            <div className="small text-dark d-flex align-items-center gap-1 mb-1">
                              <Mail size={13} className="text-muted" /> {emp.email}
                            </div>
                            <div className="small text-muted d-flex align-items-center gap-1">
                              <Phone size={13} /> {emp.phone || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                emp.status === 'Active'
                                  ? 'bg-success-subtle text-success border border-success-subtle'
                                  : 'bg-secondary'
                              }`}
                            >
                              {emp.status || 'Active'}
                            </span>
                          </td>
                          {isHR && (
                            <td className="fw-semibold text-dark">
                              ${emp.salary?.toLocaleString() || '0'}
                            </td>
                          )}
                          <td className="text-end">
                            <div className="d-inline-flex gap-1">
                              <button
                                onClick={() => handleOpenView(emp)}
                                className="btn btn-sm btn-light border"
                                title="View Details"
                              >
                                <Eye size={15} />
                              </button>
                              {isHR && (
                                <>
                                  <button
                                    onClick={() => handleOpenEdit(emp)}
                                    className="btn btn-sm btn-light border text-primary"
                                    title="Edit Profile"
                                  >
                                    <Edit2 size={15} />
                                  </button>
                                  {emp._id !== user?._id && (
                                    <button
                                      onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                                      className="btn btn-sm btn-light border text-danger"
                                      title="Remove"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isHR ? 6 : 5} className="text-center py-5 text-muted">
                          No employees found matching the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD EMPLOYEE MODAL (HR ONLY) */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Register New Employee</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleCreateEmployee}>
                <div className="modal-body p-4">
                  {modalError && <div className="alert alert-danger py-2 small">{modalError}</div>}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">System Role *</label>
                      <select
                        name="role"
                        className="form-select"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR Administrator</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Department *</label>
                      <select
                        name="department"
                        className="form-select"
                        value={formData.department}
                        onChange={handleInputChange}
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
                      <label className="form-label small fw-semibold">Job Title / Designation *</label>
                      <input
                        type="text"
                        name="designation"
                        className="form-control"
                        required
                        value={formData.designation}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Annual Salary ($) *</label>
                      <input
                        type="number"
                        name="salary"
                        className="form-control"
                        required
                        value={formData.salary}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Contact Phone</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Employment Status</label>
                      <select
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Active">Active</option>
                        <option value="On-Leave">On-Leave</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Employee Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT EMPLOYEE MODAL (HR ONLY) */}
      {/* ======================================================== */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Employee Record</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateEmployee}>
                <div className="modal-body p-4">
                  {modalError && <div className="alert alert-danger py-2 small">{modalError}</div>}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">System Role</label>
                      <select
                        name="role"
                        className="form-select"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR Administrator</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Department</label>
                      <select
                        name="department"
                        className="form-select"
                        value={formData.department}
                        onChange={handleInputChange}
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
                      <label className="form-label small fw-semibold">Designation</label>
                      <input
                        type="text"
                        name="designation"
                        className="form-control"
                        value={formData.designation}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Annual Salary ($)</label>
                      <input
                        type="number"
                        name="salary"
                        className="form-control"
                        value={formData.salary}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Status</label>
                      <select
                        name="status"
                        className="form-select"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="Active">Active</option>
                        <option value="On-Leave">On-Leave</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW EMPLOYEE MODAL (ALL ROLES) */}
      {/* ======================================================== */}
      {showViewModal && selectedEmployee && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Employee Profile</h5>
                <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle bg-primary text-white fs-2 fw-bold d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '70px', height: '70px' }}
                >
                  {selectedEmployee.name?.charAt(0).toUpperCase()}
                </div>
                <h5 className="fw-bold text-dark mb-1">{selectedEmployee.name}</h5>
                <p className="text-muted small mb-3">
                  {selectedEmployee.designation} • {selectedEmployee.department}
                </p>

                <div className="bg-light p-3 rounded-3 text-start small d-flex flex-column gap-2 mb-3">
                  <div><strong>Employee ID:</strong> {selectedEmployee.employeeId || 'EMP'}</div>
                  <div><strong>Email:</strong> {selectedEmployee.email}</div>
                  <div><strong>Phone:</strong> {selectedEmployee.phone || 'N/A'}</div>
                  <div><strong>Status:</strong> {selectedEmployee.status}</div>
                  <div><strong>Date Joined:</strong> {new Date(selectedEmployee.dateOfJoining || selectedEmployee.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary w-100" onClick={() => setShowViewModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
