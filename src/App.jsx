import { useState } from 'react'
import { useResume } from './hooks/useResume'
import { ResumeForm } from './components/ResumeForm'
import { ResumePreview } from './components/ResumePreview'
import { Sidebar } from './components/Sidebar'
import './App.css'

function App() {
  const resume = useResume()
  const [activeSection, setActiveSection] = useState('personal')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
  ]

  const handleDownload = () => {
    window.print()
  }

  const activeIndex = sections.findIndex(s => s.id === activeSection)

  return (
    <div className="app-root">

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-inner">

          {/* Left: brand */}
          <div className="header-left">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="menu-toggle"
              aria-label="Toggle sidebar"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="brand">
              <div className="brand-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <span className="brand-title">ResumeAI</span>
                <span className="brand-sub">Professional Resume Builder</span>
              </div>
            </div>
          </div>

          {/* Center: step pills */}
          <div className="header-center">
            <nav className="step-nav">
              {sections.map((section, i) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`step-btn ${activeSection === section.id ? 'step-active' : ''} ${activeIndex > i ? 'step-done' : ''}`}
                >
                  <span className="step-num">
                    {activeIndex > i
                      ? <svg width="9" height="9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      : i + 1}
                  </span>
                  <span className="step-text">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right: template + download */}
          <div className="header-right">
            <label className="template-wrap">
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="template-select"
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
              </select>
            </label>
            <button onClick={handleDownload} className="download-btn">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="app-body">

        {/* Sidebar rendered normally — it handles its own fixed/absolute positioning */}
        <Sidebar
          sections={sections}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Editor + Preview wrapper — pushed right by sidebar width when open */}
        <div className={`workspace ${isSidebarOpen ? 'sidebar-open' : ''}`}>

          {/* Editor column */}
          <div className="editor-col">
            <div className="editor-scroll">
              <ResumeForm
                resume={resume.resume}
                updatePersonalInfo={resume.updatePersonalInfo}
                updateSummary={resume.updateSummary}
                addSkill={resume.addSkill}
                removeSkill={resume.removeSkill}
                addExperience={resume.addExperience}
                updateExperience={resume.updateExperience}
                removeExperience={resume.removeExperience}
                addEducation={resume.addEducation}
                updateEducation={resume.updateEducation}
                removeEducation={resume.removeEducation}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                sections={sections}
              />
            </div>
          </div>

          {/* Preview column */}
          <div className="preview-col" id="resume-preview">
            <div className="preview-topbar">
              <div className="traffic-lights">
                <span className="tl red" />
                <span className="tl yellow" />
                <span className="tl green" />
                <span className="preview-title">Live Preview</span>
              </div>
              <span className="live-badge">
                <span className="live-dot" />
                Auto-updating
              </span>
            </div>
            <div className="preview-canvas">
              <div className="preview-paper">
                <ResumePreview resume={resume.resume} template={selectedTemplate} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile FAB */}
      <button className="fab" onClick={() => setShowMobilePreview(true)}>
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Preview
      </button>

      {/* Mobile modal */}
      {showMobilePreview && (
        <div className="modal-backdrop" onClick={() => setShowMobilePreview(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">Resume Preview</span>
              <button className="modal-close" onClick={() => setShowMobilePreview(false)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <ResumePreview resume={resume.resume} template={selectedTemplate} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App