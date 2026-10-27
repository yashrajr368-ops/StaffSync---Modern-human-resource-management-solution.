import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  GraduationCap,
  Plus,
  BookOpen,
  CheckCircle,
  Clock,
  ExternalLink,
  Users,
  Award,
  Sliders,
  Trash2,
} from 'lucide-react';

const Training = () => {
  const { user } = useAuth();
  const isManagerOrHR = user?.role === 'manager' || user?.role === 'hr' || user?.role === 'admin';

  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'Technical Skills',
    trainer: user?.name || '',
    durationHours: 8,
    endDate: '',
    materialsUrl: '',
    assignedEmployeeIds: [],
  });
  const [createError, setCreateError] = useState('');

  // Update Progress Modal (For employees)
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [progressValue, setProgressValue] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/training');
      if (res.data.success) {
        setTrainings(res.data.trainings);
      }
    } catch (err) {
      console.error('Error fetching trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchTrainings();
    if (isManagerOrHR) {
      fetchEmployees();
    }
  }, []);

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleEmployeeToggle = (empId) => {
    const list = [...createForm.assignedEmployeeIds];
    const index = list.indexOf(empId);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(empId);
    }
    setCreateForm({ ...createForm, assignedEmployeeIds: list });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      const res = await api.post('/training', createForm);
      if (res.data.success) {
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          description: '',
          category: 'Technical Skills',
          trainer: user?.name || '',
          durationHours: 8,
          endDate: '',
          materialsUrl: '',
          assignedEmployeeIds: [],
        });
        fetchTrainings();
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Error creating training program');
    }
  };

  const handleOpenProgress = (training) => {
    setSelectedTraining(training);
    const myAssignment = training.assignedTo?.find(
      (a) => a.user?._id === user?._id || a.user === user?._id
    );
    setProgressValue(myAssignment ? myAssignment.progress || 0 : 0);
    setFeedbackText(myAssignment ? myAssignment.feedback || '' : '');
    setShowProgressModal(true);
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    try {
      const newStatus = Number(progressValue) === 100 ? 'Completed' : 'In-Progress';
      await api.put(`/training/${selectedTraining._id}/progress`, {
        progress: Number(progressValue),
        status: newStatus,
        feedback: feedbackText,
      });
      setShowProgressModal(false);
      fetchTrainings();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating progress');
    }
  };

  const handleDeleteTraining = async (id) => {
    if (window.confirm('Are you sure you want to delete this training program?')) {
      try {
        await api.delete(`/training/${id}`);
        fetchTrainings();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting program');
      }
    }
  };

  return (
    <div className="main-content">
      <Navbar title="Training & Workforce Growth" />

      <div className="p-4 overflow-y-auto">
        {/* Header Action Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-1">Professional Development Hub</h4>
            <p className="text-secondary small mb-0">
              Manage learning programs, skill pathways, and employee certifications.
            </p>
          </div>

          {isManagerOrHR && (
            <button
              onClick={() => {
                setCreateError('');
                setShowCreateModal(true);
              }}
              className="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm"
            >
              <Plus size={18} />
              <span>Create Program</span>
            </button>
          )}
        </div>

        {/* Training Programs Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="text-muted small mt-2">Loading courses & modules...</div>
          </div>
        ) : (
          <div className="row g-4">
            {trainings && trainings.length > 0 ? (
              trainings.map((prog) => {
                const myAssignment = prog.assignedTo?.find(
                  (a) => a.user?._id === user?._id || a.user === user?._id
                );
                const totalAssigned = prog.assignedTo?.length || 0;
                const completedCount =
                  prog.assignedTo?.filter((a) => a.status === 'Completed').length || 0;
                const overallPercent =
                  totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

                return (
                  <div key={prog._id} className="col-lg-6">
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body p-4 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill">
                              {prog.category}
                            </span>
                            {isManagerOrHR && (
                              <button
                                onClick={() => handleDeleteTraining(prog._id)}
                                className="btn btn-sm btn-link text-danger p-0"
                                title="Delete Program"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <h5 className="fw-bold text-dark mb-2">{prog.title}</h5>
                          <p className="text-secondary small mb-3">{prog.description}</p>

                          <div className="p-3 bg-light rounded-3 small mb-3 d-flex flex-wrap gap-3 justify-content-between">
                            <div>
                              <strong className="text-muted">Instructor:</strong> {prog.trainer}
                            </div>
                            <div>
                              <strong className="text-muted">Duration:</strong> {prog.durationHours} Hours
                            </div>
                            {prog.endDate && (
                              <div>
                                <strong className="text-muted">Target Completion:</strong>{' '}
                                {new Date(prog.endDate).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </div>
                            )}
                          </div>

                          {/* If Manager/HR: Show Team Completion Stats */}
                          {isManagerOrHR && (
                            <div className="mb-3">
                              <div className="d-flex justify-content-between small fw-semibold mb-1">
                                <span>Team Completion Rate:</span>
                                <span>
                                  {completedCount} of {totalAssigned} Employees ({overallPercent}%)
                                </span>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div
                                  className="progress-bar bg-success"
                                  style={{ width: `${overallPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* If Regular Employee: Show Personal Progress Slider & Status */}
                          <div className="p-3 border rounded-3 mb-3 bg-white">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="small fw-semibold text-secondary">
                                My Completion Progress:
                              </span>
                              <span className="badge bg-light text-dark border">
                                {myAssignment ? myAssignment.status : 'Not Enrolled'}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                <div
                                  className={`progress-bar ${
                                    myAssignment?.progress === 100 ? 'bg-success' : 'bg-primary'
                                  }`}
                                  style={{ width: `${myAssignment ? myAssignment.progress : 0}%` }}
                                ></div>
                              </div>
                              <span className="fw-bold small">
                                {myAssignment ? myAssignment.progress : 0}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                          {prog.materialsUrl ? (
                            <a
                              href={prog.materialsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-link text-decoration-none d-flex align-items-center gap-1 p-0"
                            >
                              <ExternalLink size={14} /> Course Resources
                            </a>
                          ) : (
                            <span className="text-muted small">Course syllabus included</span>
                          )}

                          <button
                            onClick={() => handleOpenProgress(prog)}
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          >
                            <Sliders size={14} /> Update My Progress
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center py-5 text-muted">
                No training programs created yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* CREATE TRAINING MODAL (MANAGERS & HR) */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Create Team Training Program</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  {createError && <div className="alert alert-danger py-2 small">{createError}</div>}

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Program Title *</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        placeholder="e.g. Microservices & Distributed Architecture"
                        required
                        value={createForm.title}
                        onChange={handleCreateChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description & Learning Goals *</label>
                      <textarea
                        name="description"
                        rows="3"
                        className="form-control"
                        placeholder="Provide details on outcomes and syllabus..."
                        required
                        value={createForm.description}
                        onChange={handleCreateChange}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Skill Category</label>
                      <select
                        name="category"
                        className="form-select"
                        value={createForm.category}
                        onChange={handleCreateChange}
                      >
                        <option value="Technical Skills">Technical Skills</option>
                        <option value="Leadership & Management">Leadership & Management</option>
                        <option value="Compliance & Safety">Compliance & Safety</option>
                        <option value="Customer Service">Customer Service</option>
                        <option value="Soft Skills & Productivity">Soft Skills & Productivity</option>
                        <option value="Product & Architecture">Product & Architecture</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Trainer / Facilitator</label>
                      <input
                        type="text"
                        name="trainer"
                        className="form-control"
                        value={createForm.trainer}
                        onChange={handleCreateChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Duration (Hours)</label>
                      <input
                        type="number"
                        name="durationHours"
                        className="form-control"
                        value={createForm.durationHours}
                        onChange={handleCreateChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Completion Deadline</label>
                      <input
                        type="date"
                        name="endDate"
                        className="form-control"
                        value={createForm.endDate}
                        onChange={handleCreateChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Materials / Documentation Link</label>
                      <input
                        type="url"
                        name="materialsUrl"
                        className="form-control"
                        placeholder="https://..."
                        value={createForm.materialsUrl}
                        onChange={handleCreateChange}
                      />
                    </div>

                    {/* Assign Team Members Checkboxes */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold">
                        Assign Employees to this Module ({createForm.assignedEmployeeIds.length} selected):
                      </label>
                      <div
                        className="p-3 border rounded-3 bg-light overflow-y-auto"
                        style={{ maxHeight: '160px' }}
                      >
                        {employees && employees.length > 0 ? (
                          employees.map((emp) => (
                            <div key={emp._id} className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`assign-${emp._id}`}
                                checked={createForm.assignedEmployeeIds.includes(emp._id)}
                                onChange={() => handleEmployeeToggle(emp._id)}
                              />
                              <label className="form-check-label small" htmlFor={`assign-${emp._id}`}>
                                <strong>{emp.name}</strong> ({emp.department} - {emp.designation})
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="small text-muted">No employees available.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Publish Program
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* UPDATE PROGRESS MODAL (EMPLOYEE) */}
      {/* ======================================================== */}
      {showProgressModal && selectedTraining && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Update Training Progress</h5>
                <button type="button" className="btn-close" onClick={() => setShowProgressModal(false)}></button>
              </div>
              <form onSubmit={handleProgressSubmit}>
                <div className="modal-body p-4">
                  <h6 className="fw-bold mb-1">{selectedTraining.title}</h6>
                  <p className="text-muted small mb-3">{selectedTraining.category}</p>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-semibold mb-0">Progress Percentage:</label>
                      <span className="fw-bold fs-5 text-primary">{progressValue}%</span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="100"
                      step="5"
                      value={progressValue}
                      onChange={(e) => setProgressValue(e.target.value)}
                    />
                    <div className="d-flex justify-content-between small text-muted">
                      <span>0% (Enrolled)</span>
                      <span>50% (In-Progress)</span>
                      <span>100% (Completed)</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Notes / Feedback / Key Learnings</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Add any feedback or notes on what you completed..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowProgressModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Progress
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;
