import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import {
  Clock,
  PlayCircle,
  StopCircle,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  Search,
} from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const isHRorManager = user?.role === 'hr' || user?.role === 'manager' || user?.role === 'admin';

  const [activeTab, setActiveTab] = useState(isHRorManager ? 'org' : 'my');
  const [todayStatus, setTodayStatus] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [historyStats, setHistoryStats] = useState(null);
  const [orgAttendance, setOrgAttendance] = useState([]);

  const [clockLoading, setClockLoading] = useState(false);
  const [clockMsg, setClockMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // Filters for Org view
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data.success) {
        setTodayStatus(res.data);
      }
    } catch (err) {
      console.error('Error fetching today attendance:', err);
    }
  };

  const fetchMyHistory = async () => {
    try {
      const res = await api.get('/attendance/my-history');
      if (res.data.success) {
        setMyHistory(res.data.records);
        setHistoryStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const fetchOrgAttendance = async () => {
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterDept !== 'All') params.department = filterDept;
      if (filterStatus !== 'All') params.status = filterStatus;

      const res = await api.get('/attendance/all', { params });
      if (res.data.success) {
        setOrgAttendance(res.data.records);
      }
    } catch (err) {
      console.error('Error fetching org attendance:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchTodayStatus(),
        fetchMyHistory(),
        isHRorManager ? fetchOrgAttendance() : Promise.resolve(),
      ]);
      setLoading(false);
    };
    loadAll();
  }, [filterDate, filterDept, filterStatus]);

  const handleClockIn = async () => {
    setClockLoading(true);
    setClockMsg('');
    try {
      const res = await api.post('/attendance/clock-in');
      setClockMsg(res.data.message);
      await fetchTodayStatus();
      await fetchMyHistory();
    } catch (err) {
      setClockMsg(err.response?.data?.message || 'Error clocking in');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    setClockMsg('');
    try {
      const res = await api.post('/attendance/clock-out');
      setClockMsg(res.data.message);
      await fetchTodayStatus();
      await fetchMyHistory();
    } catch (err) {
      setClockMsg(err.response?.data?.message || 'Error clocking out');
    } finally {
      setClockLoading(false);
    }
  };

  return (
    <div className="main-content">
      <Navbar title="Attendance & Time Tracking" />

      <div className="p-4 overflow-y-auto">
        {/* Header with Tab Switcher for Leaders */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-1">Time & Shift Management</h4>
            <p className="text-secondary small mb-0">
              Clock in/out daily and monitor organization-wide shift compliance.
            </p>
          </div>

          {isHRorManager && (
            <div className="btn-group p-1 bg-white border rounded-3 shadow-sm">
              <button
                className={`btn btn-sm ${
                  activeTab === 'org' ? 'btn-primary' : 'btn-light border-0'
                } rounded-2`}
                onClick={() => setActiveTab('org')}
              >
                Organization Attendance
              </button>
              <button
                className={`btn btn-sm ${
                  activeTab === 'my' ? 'btn-primary' : 'btn-light border-0'
                } rounded-2`}
                onClick={() => setActiveTab('my')}
              >
                My Personal Log
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: MY PERSONAL CLOCK & ATTENDANCE LOG */}
        {/* ======================================================== */}
        {activeTab === 'my' && (
          <>
            {/* Clock-In Widget & KPI Cards */}
            <div className="row g-4 mb-4">
              <div className="col-lg-5">
                <div
                  className="card border-0 shadow-sm text-white h-100"
                  style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    borderRadius: '16px',
                  }}
                >
                  <div className="card-body p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge bg-primary px-3 py-1 rounded-pill">
                          Today's Timestamp
                        </span>
                        <span className="small text-light">
                          {new Date().toLocaleDateString([], {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <h4 className="fw-bold text-white mb-1">Workstation Punch Clock</h4>
                      <p className="text-secondary small mb-3">
                        Mark attendance with precision. Automatically logs timestamps and calculates shift duration.
                      </p>

                      <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small text-secondary">Clocked In:</span>
                          <span className="fw-bold text-white">
                            {todayStatus?.attendance?.clockIn
                              ? new Date(todayStatus.attendance.clockIn).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Not recorded today'}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small text-secondary">Clocked Out:</span>
                          <span className="fw-bold text-white">
                            {todayStatus?.attendance?.clockOut
                              ? new Date(todayStatus.attendance.clockOut).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '--'}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="small text-secondary">Total Shift Hours:</span>
                          <span className="badge bg-info text-dark">
                            {todayStatus?.attendance?.totalHours || 0} Hours
                          </span>
                        </div>
                      </div>

                      {clockMsg && (
                        <div className="alert alert-info py-2 px-3 small rounded-3 mb-3">
                          {clockMsg}
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      {!todayStatus?.isClockedIn ? (
                        <button
                          onClick={handleClockIn}
                          disabled={clockLoading}
                          className="btn btn-primary flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow"
                        >
                          <PlayCircle size={20} />
                          <span>Clock In</span>
                        </button>
                      ) : !todayStatus?.isClockedOut ? (
                        <button
                          onClick={handleClockOut}
                          disabled={clockLoading}
                          className="btn btn-warning flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow text-dark"
                        >
                          <StopCircle size={20} />
                          <span>Clock Out</span>
                        </button>
                      ) : (
                        <div className="w-100 text-center py-2 bg-success-subtle text-success rounded-3 fw-semibold">
                          ✅ Shift completed for today!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Statistics */}
              <div className="col-lg-7">
                <div className="row g-3 h-100">
                  <div className="col-sm-6">
                    <StatCard
                      title="Total Days Logged"
                      value={historyStats?.totalDays || 0}
                      icon={<Calendar size={24} />}
                      color="primary"
                      subtext="All recorded shifts"
                    />
                  </div>
                  <div className="col-sm-6">
                    <StatCard
                      title="Present / On-Time"
                      value={historyStats?.totalDaysPresent || 0}
                      icon={<CheckCircle2 size={24} />}
                      color="success"
                      subtext="Days actively attended"
                    />
                  </div>
                  <div className="col-sm-6">
                    <StatCard
                      title="Late Arrivals"
                      value={historyStats?.totalLate || 0}
                      icon={<AlertTriangle size={24} />}
                      color="warning"
                      subtext="Checked in after 9:30 AM"
                    />
                  </div>
                  <div className="col-sm-6">
                    <StatCard
                      title="Accumulated Hours"
                      value={`${historyStats?.totalHours || 0}h`}
                      icon={<Clock size={24} />}
                      color="info"
                      subtext="Total productive hours"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Personal History Table */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <span className="fw-bold">My Attendance Records</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Clock-In</th>
                        <th>Clock-Out</th>
                        <th>Hours Worked</th>
                        <th>Status</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myHistory && myHistory.length > 0 ? (
                        myHistory.map((item) => (
                          <tr key={item._id}>
                            <td className="fw-semibold">
                              {new Date(item.date).toLocaleDateString([], {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td>
                              {item.clockIn
                                ? new Date(item.clockIn).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '--'}
                            </td>
                            <td>
                              {item.clockOut
                                ? new Date(item.clockOut).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '--'}
                            </td>
                            <td className="fw-bold">{item.totalHours || 0} hrs</td>
                            <td>
                              <span
                                className={`badge ${
                                  item.status === 'Present'
                                    ? 'bg-success'
                                    : item.status === 'Late'
                                    ? 'bg-warning text-dark'
                                    : item.status === 'Half-day'
                                    ? 'bg-info text-dark'
                                    : 'bg-danger'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="small text-muted">{item.notes || 'Normal punch'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-muted">
                            No attendance history logged yet. Clock in to create your first record!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: ORGANIZATION-WIDE ATTENDANCE (HR/MANAGERS) */}
        {/* ======================================================== */}
        {activeTab === 'org' && isHRorManager && (
          <>
            {/* Filter Toolbar */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body p-3">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">Department</label>
                    <select
                      className="form-select"
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
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
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-secondary">Attendance Status</label>
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Half-day">Half-day</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Org Records Table */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold">Company-Wide Punch Log</span>
                  <span className="badge bg-primary rounded-pill">
                    {orgAttendance.length} Records
                  </span>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Clock-In</th>
                        <th>Clock-Out</th>
                        <th>Total Hours</th>
                        <th>Status</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orgAttendance && orgAttendance.length > 0 ? (
                        orgAttendance.map((rec) => (
                          <tr key={rec._id}>
                            <td>
                              <div className="fw-bold text-dark">{rec.user?.name}</div>
                              <small className="text-muted">{rec.user?.employeeId}</small>
                            </td>
                            <td>
                              <span className="badge bg-light text-secondary border">
                                {rec.user?.department}
                              </span>
                            </td>
                            <td className="small">
                              {rec.clockIn
                                ? new Date(rec.clockIn).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '--'}
                            </td>
                            <td className="small">
                              {rec.clockOut
                                ? new Date(rec.clockOut).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '--'}
                            </td>
                            <td className="fw-bold">{rec.totalHours || 0} hrs</td>
                            <td>
                              <span
                                className={`badge ${
                                  rec.status === 'Present'
                                    ? 'bg-success'
                                    : rec.status === 'Late'
                                    ? 'bg-warning text-dark'
                                    : rec.status === 'Half-day'
                                    ? 'bg-info text-dark'
                                    : 'bg-danger'
                                }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                            <td className="small text-muted">{rec.notes || 'Normal check-in'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">
                            No attendance records match the selected date or filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Attendance;
