import React from 'react'
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Mic,
    Eye,
    Tags,
    Plug,
    Users,
    ChevronRight
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', sublabel: 'Orchestrator', color: '#7c3aed' },
    { path: '/intake', icon: Mic, label: 'Intake Agent', sublabel: 'Voice · Image · Text', color: '#06b6d4' },
    { path: '/vision', icon: Eye, label: 'Vision Agent', sublabel: 'Document Analysis', color: '#10b981' },
    { path: '/classification', icon: Tags, label: 'Classification', sublabel: 'Categorization', color: '#f59e0b' },
    { path: '/integration', icon: Plug, label: 'Integration (MCP)', sublabel: 'APIs & Databases', color: '#3b82f6' },
    { path: '/candidates', icon: Users, label: 'Candidates', sublabel: 'Portal & Matches', color: '#f43f5e' },
]

function Sidebar({ isOpen }) {
    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-section-title">
                {isOpen ? 'AGENT PIPELINE' : ''}
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `sidebar-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <div
                                className="sidebar-icon"
                                style={{ '--item-color': item.color }}
                            >
                                <Icon size={18} />
                            </div>
                            {isOpen && (
                                <div className="sidebar-item-text">
                                    <span className="sidebar-label">{item.label}</span>
                                    <span className="sidebar-sublabel">{item.sublabel}</span>
                                </div>
                            )}
                            {isOpen && (
                                <ChevronRight size={14} className="sidebar-arrow" />
                            )}
                            {index < navItems.length - 1 && isOpen && (
                                <div className="pipeline-line" style={{ '--item-color': item.color }} />
                            )}
                        </NavLink>
                    )
                })}
            </nav>

            {isOpen && (
                <div className="sidebar-footer">
                    <div className="sidebar-stat">
                        <span className="stat-number">1,247</span>
                        <span className="stat-label">Candidates Processed</span>
                    </div>
                </div>
            )}
        </aside>
    )
}

export default Sidebar
