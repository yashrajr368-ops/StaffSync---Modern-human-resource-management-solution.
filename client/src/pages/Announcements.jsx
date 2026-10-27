import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  Megaphone,
  Plus,
  Tag,
  AlertTriangle,
  Calendar,
  User,
  Trash2,
  Bell,
} from 'lucide-react';

const Announcements = () => {
  const { user } = useAuth();
  const isHR = user?.role === 'hr' || user?.role === 'admin';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Medium',
    targetDepartment: 'All',
  });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;

      const res = await api.get('/announcements', { params });
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [categoryFilter, priorityFilter]);

  const handleInputChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);
    try {
      const res = await api.post('/announcements', createForm);
      if (res.data.success) {
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          content: '',
          category: 'General',
          priority: 'Medium',
          targetDepartment: 'All',
        });
        fetchAnnouncements();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error posting announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bulletin?')) {
      try {
        await api.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting bulletin');
      }
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return <span className="badge bg-danger">Critical Priority</span>;
      case 'High':
        return <span className="badge bg-warning text-dark">High Priority</span>;
      case 'Medium':
        return <span className="badge bg-primary-subtle text-primary border">Medium Priority</span>;
      default:
        return <span className="badge bg-light text-secondary border">General Notice</span>;
    }
  };

  return (
    <div className="main-content">
      <Navbar title="Company Bulletins & Announcements" />

      <div className="p-4 overflow-y-auto">
        {/* Header Action Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-1">Organization News & Notice Board</h4>
            <p className="text-secondary small mb-0">
              Stay informed with official communications, policy updates, and company events.
            </p>
          </div>

          {isHR && (
            <button
              onClick={() => {
                setModalError('');
                setShowCreateModal(true);
              }}
              className="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm"
            >
              <Plus size={18} />
              <span>Post Announcement</span>
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Filter by Category</label>
                <select
                  className="form-select"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="General">General</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Policy Update">Policy Update</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Event">Event</option>
                  <option value="Celebration">Celebration</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-secondary">Filter by Priority</label>
                <select
                  className="form-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bulletins Feed */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="text-muted small mt-2">Loading announcements...</div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {announcements && announcements.length > 0 ? (
              announcements.map((item) => (
                <div
                  key={item._id}
                  className={`card shadow-sm border-0 border-start border-4 ${
                    item.priority === 'Critical'
                      ? 'border-danger'
                      : item.priority === 'High'
                      ? 'border-warning'
                      : 'border-primary'
                  }`}
                >
                  <div className="card-body p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-2 mb-2">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-light text-dark border">
                            {item.category}
                          </span>
                          {getPriorityBadge(item.priority)}
                          <span className="text-muted small">
                            Target: {item.targetDepartment}
                          </span>
                        </div>
                        <h5 className="fw-bold text-dark mb-0">{item.title}</h5>
                      </div>

                      {isHR && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          title="Delete Notice"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </div>

                    <p className="text-secondary mb-3 mt-2" style={{ whiteSpace: 'pre-line' }}>
                      {item.content}
                    </p>

                    <div className="pt-2 border-top d-flex align-items-center gap-2 text-muted small">
                      <User size={14} />
                      <span>Published by {item.author?.name || 'HR Admin'}</span>
                      <span>•</span>
                      <Calendar size={14} />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card border-0 shadow-sm p-5 text-center text-muted">
                No announcements found matching the selected filters.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* POST ANNOUNCEMENT MODAL (HR ONLY) */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Broadcast Company Announcement</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  {modalError && <div className="alert alert-danger py-2 small">{modalError}</div>}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Announcement Title *</label>
                    <input
                      type="text"
                      name="title"
                      className="form-control"
                      placeholder="e.g. Q4 Townhall & Benefits Renewal"
                      required
                      value={createForm.title}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Category</label>
                      <select
                        name="category"
                        className="form-select"
                        value={createForm.category}
                        onChange={handleInputChange}
                      >
                        <option value="General">General</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Policy Update">Policy Update</option>
                        <option value="Holiday">Holiday</option>
                        <option value="Event">Event</option>
                        <option value="Celebration">Celebration</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Priority Level</label>
                      <select
                        name="priority"
                        className="form-select"
                        value={createForm.priority}
                        onChange={handleInputChange}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Target Department</label>
                      <select
                        name="targetDepartment"
                        className="form-select"
                        value={createForm.targetDepartment}
                        onChange={handleInputChange}
                      >
                        <option value="All">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Sales">Sales</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Bulletin Content *</label>
                    <textarea
                      name="content"
                      rows="5"
                      className="form-control"
                      placeholder="Write announcement body..."
                      required
                      value={createForm.content}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
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

export default Announcements;
