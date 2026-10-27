import React from 'react';

const StatCard = ({ title, value, icon, color = 'primary', subtext, trend }) => {
  const colorMap = {
    primary: { bg: 'bg-primary-subtle', text: 'text-primary' },
    success: { bg: 'bg-success-subtle', text: 'text-success' },
    warning: { bg: 'bg-warning-subtle', text: 'text-warning' },
    info: { bg: 'bg-info-subtle', text: 'text-info' },
    danger: { bg: 'bg-danger-subtle', text: 'text-danger' },
    purple: { bg: 'rgba(147, 51, 234, 0.1)', text: 'text-purple' },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div className="stat-card">
      <div>
        <div className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.84rem' }}>
          {title}
        </div>
        <div className="fw-bold text-dark fs-3 mb-1" style={{ letterSpacing: '-0.5px' }}>
          {value}
        </div>
        {subtext && (
          <div className="text-muted" style={{ fontSize: '0.78rem' }}>
            {subtext}
          </div>
        )}
      </div>
      <div className={`stat-icon-wrapper ${scheme.bg} ${scheme.text}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
