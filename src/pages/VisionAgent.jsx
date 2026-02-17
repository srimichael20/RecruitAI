import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Eye, Upload, FileText, Image, CheckCircle,
    Search, ZoomIn, Sparkles, File, X, Clock
} from 'lucide-react'
import './VisionAgent.css'

const pageTransition = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: { duration: 0.3 }
}

const API_BASE = 'http://localhost:8000/api/v1'

function VisionAgent() {
    const [selectedDoc, setSelectedDoc] = useState(0)
    const [showExtraction, setShowExtraction] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [extractedFields, setExtractedFields] = useState([])
    const [processedDocs, setProcessedDocs] = useState([
        { name: 'Demo_Resume.pdf', type: 'Resume', time: 'Just now', status: 'complete', fields: 8 }
    ])

    const processDocument = async (file) => {
        setIsProcessing(true)
        setShowExtraction(false)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch(`${API_BASE}/vision/upload`, {
                method: 'POST',
                body: formData
            })
            const data = await res.json()

            if (data.extracted_fields) {
                setExtractedFields(data.extracted_fields)
                // Add to processed docs list
                const newDoc = {
                    name: file.name,
                    type: data.doc_type || 'Document',
                    time: 'Just now',
                    status: 'complete',
                    fields: data.extracted_fields.length
                }
                setProcessedDocs(prev => [newDoc, ...prev])
                setSelectedDoc(0)
                setShowExtraction(true)
            }
        } catch (err) {
            console.error('Vision API error:', err)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <motion.div className="page-container vision-page" {...pageTransition}>
            <div className="page-header">
                <div className="header-with-badge">
                    <h1>
                        <span className="gradient-text">Vision</span> Agent
                    </h1>
                    <div className="agent-badge active">
                        <div className="badge-dot" />
                        Active
                    </div>
                </div>
                <p>Extract structured data from resumes, job descriptions, and documents using AI-powered vision analysis.</p>
            </div>

            <div className="vision-layout">
                {/* Upload + Document List */}
                <div className="vision-left">
                    <div className="upload-section glass-card">
                        <div className="upload-zone">
                            <Eye size={36} />
                            <p>Drop documents for AI extraction</p>
                            <span className="upload-hint">PDF, PNG, JPG, DOCX supported</span>
                            <input
                                type="file"
                                id="vision-upload"
                                style={{ display: 'none' }}
                                onChange={(e) => e.target.files[0] && processDocument(e.target.files[0])}
                            />
                            <button className="btn-primary" onClick={() => document.getElementById('vision-upload').click()}>
                                <Upload size={14} /> Upload Document
                            </button>
                        </div>
                    </div>

                    <div className="doc-list-section">
                        <div className="doc-list-header">
                            <h3 className="section-title">Processed Documents</h3>
                            <span className="doc-count">{processedDocs.length} files</span>
                        </div>
                        <div className="doc-list">
                            {processedDocs.map((doc, i) => (
                                <div
                                    key={i}
                                    className={`doc-item glass-card ${selectedDoc === i ? 'selected' : ''}`}
                                    onClick={() => { setSelectedDoc(i); setShowExtraction(true) }}
                                >
                                    <div className="doc-icon">
                                        {doc.type === 'Resume' ? <FileText size={18} /> :
                                            doc.type === 'Org Chart' ? <Image size={18} /> :
                                                <File size={18} />}
                                    </div>
                                    <div className="doc-info">
                                        <span className="doc-name">{doc.name}</span>
                                        <span className="doc-meta">
                                            {doc.type} · {doc.fields} fields · {doc.time}
                                        </span>
                                    </div>
                                    <div className="doc-status">
                                        <CheckCircle size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Extraction Results */}
                <div className="vision-right">
                    <div className="extraction-panel glass-card">
                        <div className="extraction-header">
                            <h3 className="panel-title">
                                <Sparkles size={16} /> Extraction Results
                            </h3>
                        </div>

                        {isProcessing ? (
                            <div className="processing-state">
                                <div className="processing-spinner" />
                                <p>AI is analyzing visual content...</p>
                            </div>
                        ) : showExtraction && extractedFields.length > 0 ? (
                            <>
                                <div className="document-preview">
                                    <div className="preview-header">
                                        <FileText size={16} />
                                        <span>{processedDocs[selectedDoc]?.name}</span>
                                        <span className="preview-badge">{processedDocs[selectedDoc]?.type}</span>
                                    </div>
                                    <div className="preview-visual">
                                        {/* Simplified visual for now */}
                                        <div className="preview-page">
                                            <div className="preview-line w80" />
                                            <div className="preview-line w60" />
                                            <div className="preview-line w90" />
                                            <div className="preview-highlight">
                                                <ZoomIn size={12} />
                                                <span>Analyzed Region</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="extracted-fields">
                                    <div className="fields-header">
                                        <span>Extracted Fields</span>
                                        <span className="fields-count">{extractedFields.length} fields found</span>
                                    </div>
                                    {extractedFields.map((item, i) => (
                                        <div key={i} className="extracted-field" style={{ animationDelay: `${i * 0.06}s` }}>
                                            <div className="efield-top">
                                                <span className="efield-label">{item.field}</span>
                                                <span className="efield-confidence" style={{
                                                    color: item.confidence > 90 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                                                }}>
                                                    {item.confidence}%
                                                </span>
                                            </div>
                                            <span className="efield-value">{item.value}</span>
                                            <div className="efield-bar">
                                                <div className="efield-bar-fill" style={{
                                                    width: `${item.confidence}%`,
                                                    background: item.confidence > 90 ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <Eye size={48} style={{ opacity: 0.3 }} />
                                <p>Upload a document to see AI extraction results</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default VisionAgent
