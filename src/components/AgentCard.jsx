import React from 'react'
import './AgentCard.css'

function AgentCard({ icon: Icon, title, description, status, color, stats, onClick }) {
    return (
        <div className={`agent-card glass-card ${status}`} onClick={onClick} style={{ '--agent-color': color }}>
            <div className="agent-card-header">
                <div className="agent-icon-wrap">
                    <Icon size={22} />
                </div>
                <div className="agent-status-badge">
                    <div className="status-indicator" />
                    <span>{status}</span>
                </div>
            </div>
            <h3 className="agent-card-title">{title}</h3>
            <p className="agent-card-desc">{description}</p>
            {stats && (
                <div className="agent-card-stats">
                    {stats.map((stat, i) => (
                        <div key={i} className="agent-stat">
                            <span className="agent-stat-value">{stat.value}</span>
                            <span className="agent-stat-label">{stat.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AgentCard
