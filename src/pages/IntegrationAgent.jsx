import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Plug, CheckCircle, AlertCircle, RefreshCw,
    ExternalLink, Settings, Activity, Clock,
    Zap, Database, Globe, GitBranch, Linkedin,
    Server, ArrowUpRight
} from 'lucide-react'
import './IntegrationAgent.css'

const pageTransition = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.3 }
}

const connectedSystems = [
    { name: 'LinkedIn Recruiter', icon: Linkedin, status: 'connected', lastSync: '2m ago', records: '12,456', color: '#0a66c2' },
    { name: 'GitHub', icon: GitBranch, status: 'connected', lastSync: '5m ago', records: '8,234', color: '#f0f0f0' },
    { name: 'Greenhouse ATS', icon: Server, status: 'connected', lastSync: '10m ago', records: '3,421', color: '#24a147' },
    { name: 'Lever ATS', icon: Database, status: 'connected', lastSync: '15m ago', records: '2,187', color: '#5851db' },
    { name: 'Stack Overflow', icon: Globe, status: 'connected', lastSync: '1h ago', records: '5,678', color: '#f48024' },
    { name: 'AngelList', icon: Zap, status: 'syncing', lastSync: 'now', records: '1,923', color: '#000' },
    { name: 'Internal Database', icon: Database, status: 'connected', lastSync: '30s ago', records: '45,678', color: '#7c3aed' },
    { name: 'HackerRank', icon: Activity, status: 'error', lastSync: '2h ago', records: '987', color: '#39424e' },
]

const apiLogs = [
    { time: '09:32:15', method: 'POST', endpoint: '/api/v1/candidates/sync', source: 'LinkedIn', status: 200, duration: '234ms' },
    { time: '09:32:12', method: 'GET', endpoint: '/api/v1/profiles/batch', source: 'GitHub', status: 200, duration: '189ms' },
    { time: '09:32:08', method: 'POST', endpoint: '/api/v1/ats/greenhouse/push', source: 'Greenhouse', status: 201, duration: '345ms' },
    { time: '09:31:55', method: 'GET', endpoint: '/api/v1/candidates/search', source: 'Internal DB', status: 200, duration: '67ms' },
    { time: '09:31:42', method: 'POST', endpoint: '/api/v1/profiles/enrich', source: 'Stack Overflow', status: 200, duration: '456ms' },
    { time: '09:31:30', method: 'GET', endpoint: '/api/v1/assessments', source: 'HackerRank', status: 503, duration: '2034ms' },
    { time: '09:31:18', method: 'POST', endpoint: '/api/v1/candidates/match', source: 'Orchestrator', status: 200, duration: '123ms' },
    { time: '09:31:05', method: 'PUT', endpoint: '/api/v1/ats/lever/update', source: 'Lever', status: 200, duration: '278ms' },
]

function IntegrationAgent() {
    const [selectedSystem, setSelectedSystem] = useState(null)

    return (
        <motion.div className="page-container integration-page" {...pageTransition}>
            <div className="page-header">
                <div className="header-with-badge">
                    <h1>
                        <span className="gradient-text">Integration</span> Agent (MCP)
                    </h1>
                    <div className="agent-badge active">
                        <div className="badge-dot" />
                        Active
                    </div>
                </div>
                <p>Model Context Protocol bridge connecting to external ATS platforms, talent databases, and APIs.</p>
            </div>

            {/* Connection Stats */}
            <div className="grid-4 integration-stats">
                <div className="int-stat glass-card">
                    <div className="int-stat-icon green"><CheckCircle size={18} /></div>
                    <div className="int-stat-info">
                        <span className="int-stat-value">7</span>
                        <span className="int-stat-label">Connected</span>
                    </div>
                </div>
                <div className="int-stat glass-card">
                    <div className="int-stat-icon blue"><Activity size={18} /></div>
                    <div className="int-stat-info">
                        <span className="int-stat-value">1</span>
                        <span className="int-stat-label">Syncing</span>
                    </div>
                </div>
                <div className="int-stat glass-card">
                    <div className="int-stat-icon red"><AlertCircle size={18} /></div>
                    <div className="int-stat-info">
                        <span className="int-stat-value">1</span>
                        <span className="int-stat-label">Errors</span>
                    </div>
                </div>
                <div className="int-stat glass-card">
                    <div className="int-stat-icon purple"><Database size={18} /></div>
                    <div className="int-stat-info">
                        <span className="int-stat-value">80.5K</span>
                        <span className="int-stat-label">Total Records</span>
                    </div>
                </div>
            </div>

            <div className="integration-layout">
                {/* Systems Grid */}
                <div className="systems-section">
                    <h3 className="section-title">Connected Systems</h3>
                    <div className="systems-grid">
                        {connectedSystems.map((sys, i) => {
                            const Icon = sys.icon
                            return (
                                <div
                                    key={sys.name}
                                    className={`system-card glass-card ${sys.status}`}
                                    style={{ animationDelay: `${i * 0.06}s` }}
                                >
                                    <div className="system-card-header">
                                        <div className="system-icon" style={{ background: `${sys.color}20`, color: sys.color }}>
                                            <Icon size={20} />
                                        </div>
                                        <div className={`system-status-dot ${sys.status}`} />
                                    </div>
                                    <h4 className="system-name">{sys.name}</h4>
                                    <div className="system-meta">
                                        <div className="system-meta-row">
                                            <Clock size={12} />
                                            <span>Last sync: {sys.lastSync}</span>
                                        </div>
                                        <div className="system-meta-row">
                                            <Database size={12} />
                                            <span>{sys.records} records</span>
                                        </div>
                                    </div>
                                    <div className="system-actions">
                                        <button className="btn-secondary system-btn">
                                            <RefreshCw size={12} /> Sync
                                        </button>
                                        <button className="btn-secondary system-btn">
                                            <Settings size={12} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* API Logs */}
                <div className="logs-section">
                    <div className="logs-header">
                        <h3 className="section-title">
                            <Activity size={16} /> Live API Logs
                        </h3>
                        <div className="live-indicator">
                            <div className="live-dot" />
                            <span>Live</span>
                        </div>
                    </div>
                    <div className="api-logs glass-card">
                        {apiLogs.map((log, i) => (
                            <div key={i} className={`log-entry ${log.status >= 400 ? 'error' : ''}`} style={{ animationDelay: `${i * 0.04}s` }}>
                                <span className="log-time">{log.time}</span>
                                <span className={`log-method method-${log.method.toLowerCase()}`}>{log.method}</span>
                                <span className="log-endpoint">{log.endpoint}</span>
                                <span className="log-source">{log.source}</span>
                                <span className={`log-status ${log.status >= 400 ? 'status-error' : 'status-ok'}`}>
                                    {log.status}
                                </span>
                                <span className="log-duration">{log.duration}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default IntegrationAgent
