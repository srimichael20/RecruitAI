import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Mic, MicOff, Image, Type, Upload, Send,
    CheckCircle, Loader, FileText, Sparkles
} from 'lucide-react'
import './IntakeAgent.css'

const pageTransition = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.3 }
}

const API_BASE = 'http://localhost:8000/api/v1'

// Helper to render nested values recursively
const renderValue = (value) => {
    if (Array.isArray(value)) {
        return (
            <div className="skill-tags">
                {value.map((v, idx) => (
                    <span key={idx} className="skill-tag">{typeof v === 'object' ? renderValue(v) : v}</span>
                ))}
            </div>
        )
    }
    if (typeof value === 'object' && value !== null) {
        return (
            <div className="nested-value">
                {Object.entries(value).map(([k, v]) => (
                    <div key={k} className="nested-field">
                        <span className="nested-label">{k.replace(/_/g, ' ')}:</span>
                        <span className="nested-content">{renderValue(v)}</span>
                    </div>
                ))}
            </div>
        )
    }
    return String(value)
}

function IntakeAgent() {
    const [activeMode, setActiveMode] = useState('text')
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [textInput, setTextInput] = useState('')
    const [showResults, setShowResults] = useState(false)
    const [parsedResults, setParsedResults] = useState(null)

    const handleSubmit = async () => {
        if (!textInput.trim() && activeMode === 'text') return
        setIsProcessing(true)
        setShowResults(false)
        try {
            const res = await fetch(`${API_BASE}/intake/text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textInput }),
            })
            const data = await res.json()
            setParsedResults(data.parsed_data || data)
            setShowResults(true)
        } catch (err) {
            console.error('Intake API error:', err)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleImageUpload = async (file) => {
        setIsProcessing(true)
        setShowResults(false)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch(`${API_BASE}/intake/image`, {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()
            setParsedResults(data.parsed_data || data)
            setShowResults(true)
        } catch (err) {
            console.error('Image intake error:', err)
        } finally {
            setIsProcessing(false)
        }
    }

    const toggleRecording = () => {
        setIsRecording(!isRecording)
        if (!isRecording) {
            setTimeout(() => {
                setIsRecording(false)
                setIsProcessing(true)
                // Simulate voice with a text call for now
                fetch(`${API_BASE}/intake/text`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: 'Voice recording: Looking for a cloud infrastructure engineer with AWS and Terraform experience.' }),
                })
                    .then(res => res.json())
                    .then(data => {
                        setParsedResults(data.parsed_data || data)
                        setShowResults(true)
                    })
                    .catch(err => console.error('Voice intake error:', err))
                    .finally(() => setIsProcessing(false))
            }, 3000)
        }
    }

    return (
        <motion.div className="page-container intake-page" {...pageTransition}>
            <div className="page-header">
                <div className="header-with-badge">
                    <h1>
                        <span className="gradient-text">Intake</span> Agent
                    </h1>
                    <div className="agent-badge active">
                        <div className="badge-dot" />
                        Active
                    </div>
                </div>
                <p>Capture hiring requirements through voice, image, or text. Our AI extracts structured preferences automatically.</p>
            </div>

            {/* Input Mode Selector */}
            <div className="mode-selector">
                {[
                    { id: 'voice', icon: Mic, label: 'Voice Input' },
                    { id: 'image', icon: Image, label: 'Image Upload' },
                    { id: 'text', icon: Type, label: 'Text Input' },
                ].map(mode => (
                    <button
                        key={mode.id}
                        className={`mode-btn ${activeMode === mode.id ? 'active' : ''}`}
                        onClick={() => setActiveMode(mode.id)}
                    >
                        <mode.icon size={18} />
                        <span>{mode.label}</span>
                    </button>
                ))}
            </div>

            <div className="intake-grid">
                {/* Input Panel */}
                <div className="input-panel glass-card">
                    <h3 className="panel-title">
                        {activeMode === 'voice' && 'Voice Recording'}
                        {activeMode === 'image' && 'Document Upload'}
                        {activeMode === 'text' && 'Text Description'}
                    </h3>

                    {activeMode === 'voice' && (
                        <div className="voice-input">
                            <button
                                className={`mic-button ${isRecording ? 'recording' : ''}`}
                                onClick={toggleRecording}
                            >
                                {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
                            </button>
                            <p className="voice-label">
                                {isRecording ? 'Listening... Speak your requirements' : 'Tap to start recording'}
                            </p>
                            {isRecording && (
                                <div className="waveform">
                                    {Array.from({ length: 20 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="wave-bar"
                                            style={{ animationDelay: `${i * 0.05}s` }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeMode === 'image' && (
                        <div className="image-upload">
                            <div className="upload-zone">
                                <Upload size={40} />
                                <p>Drag & drop job descriptions, org charts, or requirement docs</p>
                                <span className="upload-hint">Supports PDF, PNG, JPG, DOCX</span>
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept=".pdf,.png,.jpg,.jpeg,.docx"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files[0]) handleImageUpload(e.target.files[0])
                                    }}
                                />
                                <button className="btn-secondary upload-btn" onClick={() => {
                                    document.getElementById('file-upload').click()
                                }}>
                                    <Upload size={14} /> Browse Files
                                </button>
                            </div>
                        </div>
                    )}

                    {activeMode === 'text' && (
                        <div className="text-input">
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Describe your ideal candidate... 

Example: We need a Senior ML Engineer with 5+ years of experience in PyTorch and production ML systems. Budget is $180-220K. Remote-friendly, US timezone. Need someone who thrives in a fast-paced startup environment."
                                rows={8}
                            />
                            <div className="text-actions">
                                <span className="char-count">{textInput.length} characters</span>
                                <button className="btn-primary" onClick={handleSubmit} disabled={isProcessing}>
                                    {isProcessing ? (
                                        <><Loader size={14} className="spin" /> Processing...</>
                                    ) : (
                                        <><Send size={14} /> Analyze</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Panel */}
                <div className={`results-panel glass-card ${showResults ? 'has-results' : ''}`}>
                    <h3 className="panel-title">
                        <Sparkles size={16} /> Extracted Preferences
                    </h3>

                    {isProcessing && (
                        <div className="processing-state">
                            <div className="processing-spinner" />
                            <p>AI is analyzing your input...</p>
                            <div className="processing-steps">
                                <div className="p-step done"><CheckCircle size={14} /> Input received</div>
                                <div className="p-step active"><Loader size={14} className="spin" /> Extracting entities</div>
                                <div className="p-step"><FileText size={14} /> Structuring output</div>
                            </div>
                        </div>
                    )}

                    {!showResults && !isProcessing && (
                        <div className="empty-state">
                            <FileText size={40} />
                            <p>Submit an input to see extracted hiring preferences</p>
                        </div>
                    )}

                    {showResults && !isProcessing && parsedResults && (
                        <div className="results-data">
                            {Object.entries(parsedResults).filter(([key]) => !key.startsWith('_')).map(([key, value], i) => (
                                <div key={key} className="result-field" style={{ animationDelay: `${i * 0.08}s` }}>
                                    <span className="field-label">{key.replace(/_/g, ' ')}</span>
                                    <span className="field-value">
                                        {renderValue(value)}
                                    </span>
                                </div>
                            ))}
                            <div className="result-confidence">
                                <span>Extraction Confidence</span>
                                <div className="confidence-bar">
                                    <div className="confidence-fill" style={{ width: '96%' }} />
                                </div>
                                <span className="confidence-value">96%</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Intakes */}
            <div className="recent-intakes">
                <h3 className="section-title">Recent Intakes</h3>
                <div className="intakes-list">
                    {[
                        { role: 'Staff Frontend Engineer', mode: 'text', time: '2h ago', status: 'processed' },
                        { role: 'VP of Engineering', mode: 'voice', time: '5h ago', status: 'processed' },
                        { role: 'DevOps Lead', mode: 'image', time: '1d ago', status: 'processed' },
                        { role: 'Product Designer', mode: 'text', time: '2d ago', status: 'processed' },
                    ].map((intake, i) => (
                        <div key={i} className="intake-row glass-card">
                            <div className="intake-role">{intake.role}</div>
                            <div className="intake-mode-badge">
                                {intake.mode === 'voice' && <Mic size={12} />}
                                {intake.mode === 'text' && <Type size={12} />}
                                {intake.mode === 'image' && <Image size={12} />}
                                {intake.mode}
                            </div>
                            <span className="intake-time">{intake.time}</span>
                            <div className="intake-status">
                                <CheckCircle size={14} />
                                {intake.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

export default IntakeAgent
