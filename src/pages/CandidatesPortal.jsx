import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Search, Filter, Star, MapPin, Briefcase,
    Mail, ChevronDown, ExternalLink, Award, Clock,
    TrendingUp, UserCheck, SlidersHorizontal
} from 'lucide-react'
import './CandidatesPortal.css'

const pageTransition = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.3 }
}

const candidates = [
    {
        name: 'Alexandra Chen',
        initials: 'AC',
        title: 'Senior ML Engineer',
        company: 'Google',
        location: 'San Francisco, CA',
        matchScore: 97,
        skills: ['Python', 'PyTorch', 'MLOps', 'Kubernetes'],
        experience: '7 years',
        source: 'LinkedIn',
        status: 'new',
        screenScore: 94,
        gradientStart: '#7c3aed',
        gradientEnd: '#a78bfa',
    },
    {
        name: 'Marcus Johnson',
        initials: 'MJ',
        title: 'Staff Frontend Engineer',
        company: 'Meta',
        location: 'New York, NY',
        matchScore: 95,
        skills: ['React', 'TypeScript', 'Next.js', 'GraphQL'],
        experience: '9 years',
        source: 'Referral',
        status: 'screened',
        screenScore: 91,
        gradientStart: '#06b6d4',
        gradientEnd: '#22d3ee',
    },
    {
        name: 'Priya Patel',
        initials: 'PP',
        title: 'Senior Backend Engineer',
        company: 'Amazon',
        location: 'Seattle, WA',
        matchScore: 93,
        skills: ['Go', 'PostgreSQL', 'gRPC', 'Terraform'],
        experience: '6 years',
        source: 'GitHub',
        status: 'interview',
        screenScore: 89,
        gradientStart: '#10b981',
        gradientEnd: '#34d399',
    },
    {
        name: 'David Kim',
        initials: 'DK',
        title: 'Engineering Manager',
        company: 'Stripe',
        location: 'Remote',
        matchScore: 91,
        skills: ['Leadership', 'System Design', 'Python', 'Agile'],
        experience: '11 years',
        source: 'Outreach',
        status: 'new',
        screenScore: 88,
        gradientStart: '#f59e0b',
        gradientEnd: '#fbbf24',
    },
    {
        name: 'Sarah Williams',
        initials: 'SW',
        title: 'Data Scientist',
        company: 'Netflix',
        location: 'Los Angeles, CA',
        matchScore: 89,
        skills: ['Python', 'SQL', 'Spark', 'TensorFlow'],
        experience: '5 years',
        source: 'LinkedIn',
        status: 'screened',
        screenScore: 92,
        gradientStart: '#f43f5e',
        gradientEnd: '#fb7185',
    },
    {
        name: 'James Rodriguez',
        initials: 'JR',
        title: 'DevOps Lead',
        company: 'Airbnb',
        location: 'San Francisco, CA',
        matchScore: 87,
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        experience: '8 years',
        source: 'Stack Overflow',
        status: 'new',
        screenScore: 86,
        gradientStart: '#3b82f6',
        gradientEnd: '#60a5fa',
    },
]

const statusLabels = {
    new: { label: 'New Match', color: '#7c3aed' },
    screened: { label: 'AI Screened', color: '#06b6d4' },
    interview: { label: 'Interview', color: '#10b981' },
    offer: { label: 'Offer', color: '#f59e0b' },
}

function CandidatesPortal() {
    const [viewMode, setViewMode] = useState('grid')
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filtered = filterStatus === 'all'
        ? candidates
        : candidates.filter(c => c.status === filterStatus)

    return (
        <motion.div className="page-container candidates-page" {...pageTransition}>
            <div className="page-header">
                <div className="header-with-badge">
                    <h1>
                        <span className="gradient-text">Candidates</span> Portal
                    </h1>
                    <div className="agent-badge active">
                        <div className="badge-dot" />
                        Live
                    </div>
                </div>
                <p>AI-matched candidates delivered straight to your portal for review and interviews.</p>
            </div>

            {/* Stats Row */}
            <div className="grid-4 candidate-stats">
                <div className="cand-stat glass-card">
                    <UserCheck size={20} className="cand-stat-icon purple" />
                    <div className="cand-stat-info">
                        <span className="cand-stat-value">1,247</span>
                        <span className="cand-stat-label">Total Matches</span>
                    </div>
                </div>
                <div className="cand-stat glass-card">
                    <Star size={20} className="cand-stat-icon teal" />
                    <div className="cand-stat-info">
                        <span className="cand-stat-value">94.2%</span>
                        <span className="cand-stat-label">Avg Match Score</span>
                    </div>
                </div>
                <div className="cand-stat glass-card">
                    <Award size={20} className="cand-stat-icon green" />
                    <div className="cand-stat-info">
                        <span className="cand-stat-value">856</span>
                        <span className="cand-stat-label">AI Screened</span>
                    </div>
                </div>
                <div className="cand-stat glass-card">
                    <Clock size={20} className="cand-stat-icon amber" />
                    <div className="cand-stat-info">
                        <span className="cand-stat-value">2.3 days</span>
                        <span className="cand-stat-label">Avg Time to Match</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="candidates-controls">
                <div className="search-bar-cand glass-card">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search candidates by name, skills, or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-tabs">
                    {['all', 'new', 'screened', 'interview'].map(f => (
                        <button
                            key={f}
                            className={`filter-tab ${filterStatus === f ? 'active' : ''}`}
                            onClick={() => setFilterStatus(f)}
                        >
                            {f === 'all' ? 'All' : statusLabels[f].label}
                            {f !== 'all' && (
                                <span className="filter-count">
                                    {candidates.filter(c => c.status === f).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Candidates Grid */}
            <div className="candidates-grid">
                {filtered.map((candidate, i) => (
                    <div key={i} className="candidate-card glass-card" style={{ animationDelay: `${i * 0.08}s` }}>
                        <div className="candidate-card-header">
                            <div
                                className="candidate-avatar-lg"
                                style={{ background: `linear-gradient(135deg, ${candidate.gradientStart}, ${candidate.gradientEnd})` }}
                            >
                                {candidate.initials}
                            </div>
                            <div className="candidate-match">
                                <TrendingUp size={14} />
                                <span>{candidate.matchScore}%</span>
                            </div>
                        </div>

                        <h3 className="candidate-name">{candidate.name}</h3>

                        <div className="candidate-role">
                            <Briefcase size={13} />
                            <span>{candidate.title}</span>
                        </div>
                        <div className="candidate-company">
                            at {candidate.company} · {candidate.experience}
                        </div>
                        <div className="candidate-location">
                            <MapPin size={12} />
                            <span>{candidate.location}</span>
                        </div>

                        <div className="candidate-skills">
                            {candidate.skills.map(s => (
                                <span key={s} className="cand-skill-tag">{s}</span>
                            ))}
                        </div>

                        <div className="candidate-footer">
                            <div
                                className="candidate-status-badge"
                                style={{
                                    background: `${statusLabels[candidate.status].color}12`,
                                    color: statusLabels[candidate.status].color,
                                    borderColor: `${statusLabels[candidate.status].color}30`
                                }}
                            >
                                {statusLabels[candidate.status].label}
                            </div>
                            <div className="candidate-screen-score">
                                <Award size={12} />
                                Screen: {candidate.screenScore}%
                            </div>
                        </div>

                        <div className="candidate-actions">
                            <button className="btn-primary cand-action-btn">
                                <Mail size={13} /> Contact
                            </button>
                            <button className="btn-secondary cand-action-btn">
                                <ExternalLink size={13} /> Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

export default CandidatesPortal
