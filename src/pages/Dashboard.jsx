import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Mic, Eye, Tags, Plug, Users, LayoutDashboard,
    TrendingUp, UserCheck, Briefcase, Activity,
    ArrowRight, Zap, Clock
} from 'lucide-react'
import AgentCard from '../components/AgentCard'
import MetricCard from '../components/MetricCard'
import './Dashboard.css'

const pageTransition = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.3 }
}

const agents = [
    {
        icon: Mic,
        title: 'Intake Agent',
        description: 'Captures hiring requirements via voice, image, or text — extracting structured preferences automatically.',
        status: 'active',
        color: '#06b6d4',
        path: '/intake',
        stats: [
            { value: '342', label: 'Inputs' },
            { value: '98%', label: 'Parsed' }
        ]
    },
    {
        icon: Eye,
        title: 'Vision Agent',
        description: 'Extracts contextual data from resumes, job descriptions, and other documents using AI vision.',
        status: 'active',
        color: '#10b981',
        path: '/vision',
        stats: [
            { value: '1,892', label: 'Documents' },
            { value: '4.2s', label: 'Avg Time' }
        ]
    },
    {
        icon: Tags,
        title: 'Classification Agent',
        description: 'Categorizes candidates by skills, seniority, culture fit, and role alignment with confidence scoring.',
        status: 'active',
        color: '#f59e0b',
        path: '/classification',
        stats: [
            { value: '24', label: 'Categories' },
            { value: '94%', label: 'Accuracy' }
        ]
    },
    {
        icon: Plug,
        title: 'Integration Agent (MCP)',
        description: 'Syncs with external ATS, LinkedIn, GitHub, and custom databases via Model Context Protocol.',
        status: 'active',
        color: '#3b82f6',
        path: '/integration',
        stats: [
            { value: '8', label: 'Connected' },
            { value: '99.9%', label: 'Uptime' }
        ]
    },
]

const recentActivity = [
    { text: 'Vision Agent processed 23 resumes from Acme Corp batch', time: '2m ago', type: 'vision' },
    { text: 'Intake Agent captured voice requirements from Sarah Chen', time: '5m ago', type: 'intake' },
    { text: 'Classification Agent re-scored 142 candidates for "Senior ML Engineer"', time: '12m ago', type: 'classification' },
    { text: 'Integration Agent synced 45 new profiles from LinkedIn', time: '18m ago', type: 'integration' },
    { text: '3 new candidates matched to "Staff Frontend Engineer" role', time: '24m ago', type: 'match' },
    { text: 'Intake Agent processed image upload — org chart detected', time: '31m ago', type: 'intake' },
]

const activityColor = {
    vision: '#10b981',
    intake: '#06b6d4',
    classification: '#f59e0b',
    integration: '#3b82f6',
    match: '#f43f5e',
}

function Dashboard() {
    const navigate = useNavigate()

    return (
        <motion.div className="page-container dashboard" {...pageTransition}>
            {/* Hero Section */}
            <div className="dashboard-hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Zap size={14} />
                        <span>Orchestrator Active</span>
                    </div>
                    <h1>
                        AI Recruiting <span className="gradient-text">Pipeline</span>
                    </h1>
                    <p className="hero-subtitle">
                        5 intelligent agents working in concert to find, screen, and deliver
                        the perfect candidates — automatically.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary" onClick={() => navigate('/intake')}>
                            <Mic size={16} /> New Intake
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/candidates')}>
                            <Users size={16} /> View Candidates
                        </button>
                    </div>
                </div>

                <div className="hero-pipeline">
                    <div className="pipeline-flow">
                        {[
                            { icon: Mic, label: 'Intake', color: '#06b6d4' },
                            { icon: Eye, label: 'Vision', color: '#10b981' },
                            { icon: Tags, label: 'Classify', color: '#f59e0b' },
                            { icon: Plug, label: 'Integrate', color: '#3b82f6' },
                            { icon: Users, label: 'Deliver', color: '#f43f5e' },
                        ].map((step, i) => (
                            <React.Fragment key={step.label}>
                                <div className="pipeline-step" style={{ '--step-color': step.color }}>
                                    <div className="pipeline-step-icon">
                                        <step.icon size={20} />
                                    </div>
                                    <span>{step.label}</span>
                                </div>
                                {i < 4 && (
                                    <div className="pipeline-connector">
                                        <ArrowRight size={16} />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid-4 dashboard-metrics">
                <MetricCard icon={UserCheck} label="Candidates Matched" value="1,247" change="12% this week" changeType="up" color="#7c3aed" />
                <MetricCard icon={Briefcase} label="Active Roles" value="38" change="3 new today" changeType="up" color="#06b6d4" />
                <MetricCard icon={Activity} label="Screens Completed" value="856" change="8% increase" changeType="up" color="#10b981" />
                <MetricCard icon={TrendingUp} label="Avg Match Score" value="94.2%" change="2.1% up" changeType="up" color="#f59e0b" />
            </div>

            {/* Agent Cards */}
            <div className="dashboard-section">
                <h2 className="section-title">Agent Status</h2>
                <div className="grid-2">
                    {agents.map((agent) => (
                        <AgentCard
                            key={agent.title}
                            {...agent}
                            onClick={() => navigate(agent.path)}
                        />
                    ))}
                </div>
            </div>

            {/* Activity Feed */}
            <div className="dashboard-section">
                <h2 className="section-title">Recent Activity</h2>
                <div className="activity-feed glass-card">
                    {recentActivity.map((item, i) => (
                        <div key={i} className="activity-item" style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className="activity-dot" style={{ background: activityColor[item.type] }} />
                            <span className="activity-text">{item.text}</span>
                            <span className="activity-time">
                                <Clock size={12} /> {item.time}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

export default Dashboard
