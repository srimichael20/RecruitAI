import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Tags, Search, Filter, BarChart3, TrendingUp,
    CheckCircle, AlertCircle, ChevronDown, Sparkles
} from 'lucide-react'
import './ClassificationAgent.css'

const pageTransition = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.3 }
}

const categories = [
    { name: 'Machine Learning', count: 234, color: '#7c3aed', percentage: 85 },
    { name: 'Frontend Engineering', count: 189, color: '#06b6d4', percentage: 72 },
    { name: 'Backend Engineering', count: 312, color: '#10b981', percentage: 94 },
    { name: 'DevOps / SRE', count: 98, color: '#f59e0b', percentage: 58 },
    { name: 'Product Design', count: 67, color: '#f43f5e', percentage: 42 },
    { name: 'Data Science', count: 156, color: '#3b82f6', percentage: 68 },
    { name: 'Engineering Management', count: 45, color: '#8b5cf6', percentage: 35 },
    { name: 'Mobile Development', count: 78, color: '#22d3ee', percentage: 48 },
]

const classifications = [
    { candidate: 'Alexandra Chen', category: 'Machine Learning', confidence: 97, seniority: 'Senior', culture: 'High', skills: ['Python', 'PyTorch', 'MLOps'] },
    { candidate: 'Marcus Johnson', category: 'Frontend Engineering', confidence: 94, seniority: 'Staff', culture: 'Very High', skills: ['React', 'TypeScript', 'Next.js'] },
    { candidate: 'Priya Patel', category: 'Backend Engineering', confidence: 91, seniority: 'Senior', culture: 'High', skills: ['Go', 'Kubernetes', 'PostgreSQL'] },
    { candidate: 'James Wilson', category: 'DevOps / SRE', confidence: 89, seniority: 'Mid', culture: 'Medium', skills: ['Terraform', 'AWS', 'Docker'] },
    { candidate: 'Sarah Kim', category: 'Data Science', confidence: 96, seniority: 'Senior', culture: 'Very High', skills: ['Python', 'SQL', 'Spark'] },
    { candidate: 'David Brown', category: 'Machine Learning', confidence: 88, seniority: 'Mid', culture: 'High', skills: ['TensorFlow', 'Python', 'NLP'] },
]

const tagCloud = [
    { text: 'Python', size: 28, color: '#7c3aed' },
    { text: 'React', size: 24, color: '#06b6d4' },
    { text: 'Kubernetes', size: 20, color: '#10b981' },
    { text: 'TypeScript', size: 22, color: '#3b82f6' },
    { text: 'AWS', size: 26, color: '#f59e0b' },
    { text: 'Go', size: 18, color: '#f43f5e' },
    { text: 'ML', size: 25, color: '#8b5cf6' },
    { text: 'Docker', size: 19, color: '#22d3ee' },
    { text: 'PostgreSQL', size: 17, color: '#10b981' },
    { text: 'System Design', size: 21, color: '#f59e0b' },
    { text: 'GraphQL', size: 16, color: '#06b6d4' },
    { text: 'Node.js', size: 20, color: '#3b82f6' },
    { text: 'Rust', size: 15, color: '#f43f5e' },
    { text: 'MLOps', size: 18, color: '#7c3aed' },
    { text: 'CI/CD', size: 17, color: '#22d3ee' },
]

function ClassificationAgent() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState(null)

    const filtered = selectedCategory
        ? classifications.filter(c => c.category === selectedCategory)
        : classifications

    return (
        <motion.div className="page-container classification-page" {...pageTransition}>
            <div className="page-header">
                <div className="header-with-badge">
                    <h1>
                        <span className="gradient-text">Classification</span> Agent
                    </h1>
                    <div className="agent-badge active">
                        <div className="badge-dot" />
                        Active
                    </div>
                </div>
                <p>AI-powered categorization of candidates by skills, seniority, culture fit, and role alignment.</p>
            </div>

            {/* Search & Filters */}
            <div className="classification-controls">
                <div className="search-filter-bar glass-card">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search candidates or categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="btn-secondary">
                        <Filter size={14} /> Filters
                    </button>
                </div>
            </div>

            <div className="classification-grid">
                {/* Categories */}
                <div className="categories-panel">
                    <h3 className="section-title">
                        <BarChart3 size={16} /> Categories
                    </h3>
                    <div className="category-list">
                        {categories.map((cat, i) => (
                            <div
                                key={cat.name}
                                className={`category-item glass-card ${selectedCategory === cat.name ? 'selected' : ''}`}
                                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                <div className="category-color" style={{ background: cat.color }} />
                                <div className="category-info">
                                    <span className="category-name">{cat.name}</span>
                                    <span className="category-count">{cat.count} candidates</span>
                                </div>
                                <div className="category-bar-wrap">
                                    <div className="category-bar">
                                        <div
                                            className="category-bar-fill"
                                            style={{ width: `${cat.percentage}%`, background: cat.color }}
                                        />
                                    </div>
                                    <span className="category-pct">{cat.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tag Cloud */}
                    <h3 className="section-title" style={{ marginTop: 24 }}>
                        <Sparkles size={16} /> Skills Cloud
                    </h3>
                    <div className="tag-cloud glass-card">
                        {tagCloud.map((tag, i) => (
                            <span
                                key={tag.text}
                                className="cloud-tag"
                                style={{ fontSize: `${tag.size}px`, color: tag.color }}
                            >
                                {tag.text}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Results Table */}
                <div className="results-table-panel">
                    <h3 className="section-title">
                        <TrendingUp size={16} /> Classification Results
                        {selectedCategory && (
                            <button className="clear-filter" onClick={() => setSelectedCategory(null)}>
                                Clear filter ×
                            </button>
                        )}
                    </h3>
                    <div className="results-table glass-card">
                        <div className="table-header">
                            <span className="th-candidate">Candidate</span>
                            <span className="th-category">Category</span>
                            <span className="th-confidence">Confidence</span>
                            <span className="th-seniority">Seniority</span>
                            <span className="th-culture">Culture Fit</span>
                            <span className="th-skills">Top Skills</span>
                        </div>
                        {filtered.map((item, i) => (
                            <div key={i} className="table-row" style={{ animationDelay: `${i * 0.06}s` }}>
                                <span className="td-candidate">
                                    <div className="candidate-avatar">
                                        {item.candidate.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    {item.candidate}
                                </span>
                                <span className="td-category">
                                    <span className="cat-badge" style={{
                                        background: `${categories.find(c => c.name === item.category)?.color}15`,
                                        color: categories.find(c => c.name === item.category)?.color,
                                        borderColor: `${categories.find(c => c.name === item.category)?.color}30`
                                    }}>
                                        {item.category}
                                    </span>
                                </span>
                                <span className="td-confidence">
                                    <div className="mini-bar">
                                        <div className="mini-bar-fill" style={{
                                            width: `${item.confidence}%`,
                                            background: item.confidence > 93 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                                        }} />
                                    </div>
                                    {item.confidence}%
                                </span>
                                <span className="td-seniority">{item.seniority}</span>
                                <span className={`td-culture ${item.culture.toLowerCase().replace(' ', '-')}`}>
                                    {item.culture}
                                </span>
                                <span className="td-skills">
                                    {item.skills.map(s => (
                                        <span key={s} className="mini-tag">{s}</span>
                                    ))}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default ClassificationAgent
