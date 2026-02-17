import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sparkles, Bell, Search } from 'lucide-react'
import './Navbar.css'

function Navbar({ sidebarOpen, toggleSidebar }) {
    const location = useLocation()

    const getPageTitle = () => {
        const routes = {
            '/': 'Dashboard',
            '/intake': 'Intake Agent',
            '/vision': 'Vision Agent',
            '/classification': 'Classification Agent',
            '/integration': 'Integration Agent',
            '/candidates': 'Candidates Portal',
        }
        return routes[location.pathname] || 'Dashboard'
    }

    return (
        <nav className="navbar glass">
            <div className="navbar-left">
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <Link to="/" className="navbar-brand">
                    <div className="brand-icon">
                        <Sparkles size={20} />
                    </div>
                    <span className="brand-text">Perfectly</span>
                    <span className="brand-ai">AI</span>
                </Link>
                <div className="navbar-divider" />
                <span className="page-title-nav">{getPageTitle()}</span>
            </div>

            <div className="navbar-center">
                <div className="search-bar">
                    <Search size={16} />
                    <input type="text" placeholder="Search candidates, jobs, agents..." />
                </div>
            </div>

            <div className="navbar-right">
                <div className="nav-status">
                    <div className="status-dot active" />
                    <span>5 Agents Online</span>
                </div>
                <button className="nav-icon-btn">
                    <Bell size={18} />
                    <span className="notification-badge">3</span>
                </button>
                <div className="nav-avatar">
                    <span>HM</span>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
