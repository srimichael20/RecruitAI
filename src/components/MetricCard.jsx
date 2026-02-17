import React from 'react'
import './MetricCard.css'

function MetricCard({ icon: Icon, label, value, change, changeType, color }) {
    return (
        <div className="metric-card glass-card" style={{ '--metric-color': color || '#7c3aed' }}>
            <div className="metric-icon">
                <Icon size={20} />
            </div>
            <div className="metric-info">
                <span className="metric-label">{label}</span>
                <span className="metric-value">{value}</span>
                {change && (
                    <span className={`metric-change ${changeType || 'up'}`}>
                        {changeType === 'down' ? '↓' : '↑'} {change}
                    </span>
                )}
            </div>
        </div>
    )
}

export default MetricCard
