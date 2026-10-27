import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Filter,
} from 'lucide-react';

const Leaves = () => {
  const { user, refreshUser } = useAuth();
  const isHRorManager = user?.role === 'hr' || user?.role === 'manager' || user?.role === 'admin';

  const [activeTab, setActiveTab] = useState(isHRorManager ? 'review' : 'my');
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({ annual: 15, casual: 10, sick: 8 });
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [applyError, setApplyError] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Filter for approvals queue
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/leaves/my-leaves');
      if (res.data.success) {
        setMyLeaves(res.data.leaves);
        if (res.data.leaveBalance) {
          setLeaveBalance(res.data.leaveBalance);
        }
      }
    } catch (err) {
      console.error('Error fetching personal leaves:', err);
    }
  };

  const fetchAllLeaves = async () => {
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/leaves', { params });
      if (res.data.success) {
        setAllLeaves(res.data.leaves);
      }
    } catch (err) {
      console.error('Error fetching org leaves:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchMyLeaves(),
        isHRorManager ? fetchAllLeaves() : Promise.resolve(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [statusFilter]);

  const handleApplyChange = (e) => {
    setApplyForm({ ...applyForm, [e.target.name]: e.target.value });
  };

  const calculateDays = () => {
    if (!applyForm.startDate || !applyForm.endDate) return 0;
    const start = new Date(applyForm.startDate);
    const end = new Date(applyForm.endDate);
    if (end < start) return 0;
    const diff = Math.abs(end - start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    setApplySubmitting(true);

    try {
      const res = await api.post('/leaves', applyForm);
      if (res.data.success) {
        setShowApplyModal(false);
        setApplyForm({
          leaveType: 'casual',
          startDate: '',
          endDate: '',
          reason: '',
        });
        await fetchMyLeaves();
        if (isHRorManager) await fetchAllLeaves();
        await refreshUser();
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Error submitting application');
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleOpenReview = (leave, defaultStatus) => {
    setSelectedLeave(leave);
    setReviewStatus(defaultStatus);
    setReviewComment(defaultStatus === 'Approved' ? 'Approved by supervisor' : 'Rejected');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const res = await api.put(`/leaves/${selectedLeave._id}/review`, {
        status: reviewStatus,
        reviewComment,
      });
      if (res.data.success) {
        setShowReviewModal(false);
        await fetchAllLeaves();
        await fetchMyLeaves();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating leave');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (window.confirm('Are you sure you want to cancel this pending leave request?')) {
      try {
        await api.delete(`/leaves/${id}`);
        fetchMyLeaves();
      } catch (err) {
        alert(err.response?.data?.message || 'Error cancelling request');
      }
    }
  };

  return (
    <div className="main-content">
      <Navbar title="Leave & Time-Off Management" />

      <div className="p-4 overflow-y-auto">
        {/* Header Action Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-1">Leave Requests & Approvals</h4>
            <p className="text-secondary small mb-0">
              Apply for vacation, casual, or medical time-off and track your allowances.
            </p>
          </div>

          <div className="d-flex gap-2 align-items-center">
            {isHRorManager && (
              <div className="btn-group p-1 bg-white border rounded-3 shadow-sm">
                <button
                  className={`btn btn-sm ${
                    activeTab === 'review' ? 'btn-primary' : 'btn-light border-0'
                  } rounded-2`}
                  onClick={() => setActiveTab('review')}
                >
                  Approval Queue
                </button>
                <button
                  className={`btn btn-sm ${
                    activeTab === 'my' ? 'btn-primary' : 'btn-light border-0'
                  } rounded-2`}
                  onClick={() => setActiveTab('my')}
                >
                  My Applications
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setApplyError('');
                setShowApplyModal(true);
              }}
              className="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm"
            >
              <Plus size={18} />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>

        {/* Leave Allowance Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-sm-4">
            <StatCard
              title="Annual Leaves Available"
              value={`${leaveBalance?.annual ?? 15} Days`}
              icon={<CalendarDays size={26} />}
              color="primary"
              subtext="Paid annual vacation balance"
            />
          </div>
          <div className="col-sm-4">
            <StatCard
              title="Casual Leaves Available"
              value={`${leaveBalance?.casual ?? 10} Days`}
              icon={<Clock size={26} />}
              color="success"
              subtext="Casual / emergency allowance"
            />
          </div>
          <div className="col-sm-4">
            <StatCard
              title="Sick Leaves Available"
              value={`${leaveBalance?.sick ?? 8} Days`}
              icon={<AlertCircle size={26} />}
              color="warning"
              subtext="Medical recovery allowance"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: APPROVAL QUEUE (MANAGERS & HR) */}
        {/* ======================================================== */}
        {activeTab === 'review' && isHRorManager && (
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold">Staff Leave Requests</span>
                <span className="badge bg-primary rounded-pill">
                  {allLeaves.length} Total
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted fw-semibold">Filter:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: '140px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Only</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Duration</th>
                      <th>Reason</th>
                      <th>Current Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLeaves && allLeaves.length > 0 ? (
                      allLeaves.map((leave) => (
                        <tr key={leave._id}>
                          <td>
                            <div className="fw-bold text-dark">{leave.user?.name}</div>
                            <small className="text-muted">
                              {leave.user?.employeeId} • {leave.user?.department}
                            </small>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border text-capitalize">
                              {leave.leaveType}
                            </span>
                          </td>
                          <td>
                            <div className="fw-bold small">{leave.daysCount} Day(s)</div>
                            <small className="text-muted">
                              {new Date(leave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} to{' '}
                              {new Date(leave.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </small>
                          </td>
                          <td className="small" style={{ maxWidth: '240px' }}>
                            {leave.reason}
                            {leave.reviewComment && (
                              <div className="text-muted mt-1 fst-italic">
                                Notes: "{leave.reviewComment}"
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                leave.status === 'Approved'
                                  ? 'bg-success'
                                  : leave.status === 'Rejected'
                                  ? 'bg-danger'
                                  : 'bg-warning text-dark'
                              }`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td className="text-end">
                            {leave.status === 'Pending' ? (
                              <div className="d-inline-flex gap-1">
                                <button
                                  onClick={() => handleOpenReview(leave, 'Approved')}
                                  className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                >
                                  <CheckCircle size={14} /> Approve
                                </button>
                                <button
                                  onClick={() => handleOpenReview(leave, 'Rejected')}
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                >
                                  <XCircle size={14} /> Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted small">Reviewed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          No leave requests match the current status filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: MY PERSONAL LEAVE APPLICATIONS */}
        {/* ======================================================== */}
        {activeTab === 'my' && (
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-bold">My Leave History</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Dates Requested</th>
                      <th>Duration</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Supervisor Notes</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaves && myLeaves.length > 0 ? (
                      myLeaves.map((leave) => (
                        <tr key={leave._id}>
                          <td className="fw-bold text-capitalize">{leave.leaveType}</td>
                          <td>
                            <div className="small fw-semibold">
                              {new Date(leave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <small className="text-muted">
                              to {new Date(leave.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </small>
                          </td>
                          <td className="fw-bold">{leave.daysCount} days</td>
                          <td className="small" style={{ maxWidth: '200px' }}>
                            {leave.reason}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                leave.status === 'Approved'
                                  ? 'bg-success'
                                  : leave.status === 'Rejected'
                                  ? 'bg-danger'
                                  : 'bg-warning text-dark'
                              }`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td className="small text-muted">
                            {leave.reviewComment || (leave.status === 'Pending' ? 'Under Review' : '--')}
                          </td>
                          <td className="text-end">
                            {leave.status === 'Pending' && (
                              <button
                                onClick={() => handleCancelLeave(leave._id)}
                                className="btn btn-sm btn-outline-danger"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          You have not submitted any leave applications yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* APPLY FOR LEAVE MODAL */}
      {/* ======================================================== */}
      {showApplyModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Submit Leave Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)}></button>
              </div>
              <form onSubmit={handleApplySubmit}>
                <div className="modal-body p-4">
                  {applyError && <div className="alert alert-danger py-2 small">{applyError}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Leave Type *</label>
                    <select
                      name="leaveType"
                      className="form-select"
                      value={applyForm.leaveType}
                      onChange={handleApplyChange}
                      required
                    >
                      <option value="annual">Annual Vacation ({leaveBalance?.annual || 0} days remaining)</option>
                      <option value="casual">Casual Leave ({leaveBalance?.casual || 0} days remaining)</option>
                      <option value="sick">Sick / Medical Leave ({leaveBalance?.sick || 0} days remaining)</option>
                      <option value="maternity">Maternity / Paternity Leave</option>
                      <option value="unpaid">Unpaid Leave of Absence</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        className="form-control"
                        required
                        value={applyForm.startDate}
                        onChange={handleApplyChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        name="endDate"
                        className="form-control"
                        required
                        value={applyForm.endDate}
                        onChange={handleApplyChange}
                      />
                    </div>
                  </div>

                  {calculateDays() > 0 && (
                    <div className="alert alert-info py-2 px-3 small rounded-3 mb-3">
                      <strong>Calculated Duration:</strong> {calculateDays()} total days requested.
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason for Leave *</label>
                    <textarea
                      name="reason"
                      rows="3"
                      className="form-control"
                      placeholder="Briefly state reason for taking time off..."
                      required
                      value={applyForm.reason}
                      onChange={handleApplyChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowApplyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={applySubmitting} className="btn btn-primary">
                    {applySubmitting ? 'Submitting...' : 'Confirm & Apply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REVIEW LEAVE MODAL (APPROVE/REJECT) */}
      {/* ======================================================== */}
      {showReviewModal && selectedLeave && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Review Leave Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div><strong>Applicant:</strong> {selectedLeave.user?.name}</div>
                    <div><strong>Department:</strong> {selectedLeave.user?.department}</div>
                    <div><strong>Leave Type:</strong> {selectedLeave.leaveType} ({selectedLeave.daysCount} days)</div>
                    <div><strong>Reason:</strong> {selectedLeave.reason}</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Decision</label>
                    <select
                      className="form-select"
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                    >
                      <option value="Approved">Approve Request</option>
                      <option value="Rejected">Reject Request</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Comments / Reason</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Feedback for applicant..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowReviewModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className={`btn ${reviewStatus === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                  >
                    Confirm {reviewStatus}
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

export default Leaves;
