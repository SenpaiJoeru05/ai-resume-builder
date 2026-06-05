// EditorPage.jsx

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useResume } from '../hooks/useResume'
import { useRouting } from '../hooks/useRouting'
import { EditorSidebar } from '../components/editor/EditorSidebar'
import { EditorPreview } from '../components/editor/EditorPreview'
import { ResumeForm } from '../components/ResumeForm'
import { PDFPreviewModal } from '../components/PDFPreviewModal'
import { TemplateGallery } from '../components/TemplateGallery'

// ─── Save Status Badge ────────────────────────────────────────────
function SaveBadge({ status }) {
  const configs = {
    saved:   { dot: 'bg-emerald-400', text: 'text-emerald-600', label: 'Saved', bg: 'bg-emerald-50 border-emerald-100' },
    saving:  { dot: 'bg-amber-400 animate-pulse', text: 'text-amber-600', label: 'Saving…', bg: 'bg-amber-50 border-amber-100' },
    unsaved: { dot: 'bg-slate-300', text: 'text-slate-500', label: 'Unsaved', bg: 'bg-slate-50 border-slate-200' },
    error:   { dot: 'bg-red-400', text: 'text-red-600', label: 'Error', bg: 'bg-red-50 border-red-100' },
  }
  const c = configs[status] || configs.saved
  return (
    <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${c.bg} ${c.text} transition-all duration-300`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {c.label}
    </div>
  )
}

// ─── Section Nav Item ─────────────────────────────────────────────
function SectionNavItem({ section, isActive, onClick, hasContent }) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <span className={`text-base flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
        {section.icon}
      </span>
      <span className="text-sm font-medium flex-1 truncate">{section.label}</span>
      {hasContent && !isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
      )}
      {isActive && (
        <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}

// ─── Section Group ────────────────────────────────────────────────
function SectionGroup({ label, children }) {
  return (
    <div className="mb-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1.5">{label}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

// ─── Main Editor Page ─────────────────────────────────────────────
export function EditorPage() {
  const { resumeId } = useParams()
  const { goToDashboard } = useRouting()
  const {
    resume,
    resumes,
    activeResumeId,
    setActiveResumeId,
    createResume,
    deleteResume,
    duplicateResume,
    updatePersonalInfo,
    updateProfessionalInfo,
    updateSummary,
    addSkill, updateSkill, removeSkill,
    addExperience, updateExperience, removeExperience,
    addEducation, updateEducation, removeEducation,
    addLink, updateLink, removeLink,
    addItem, updateItem, removeItem,
    updateTemplate,
    updateTheme,
    updateSectionConfig,
    toggleSectionVisibility,
    renameSection,
    reorderSections,
    saveStatus
  } = useResume()

  const [activeSection, setActiveSection] = useState('summary')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const [mobileView, setMobileView] = useState('edit')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [demoDataLoading, setDemoDataLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const titleInputRef = useRef(null)

  // Ensure we use the correct resume based on URL parameter
  const currentResume = resumeId 
    ? resumes.find(r => r.meta.id === resumeId) || resume 
    : resume

  useEffect(() => {
    if (resumeId && activeResumeId !== resumeId) {
      setActiveResumeId(resumeId)
    }
  }, [resumeId, activeResumeId, setActiveResumeId])

  useEffect(() => {
    if (currentResume?.meta?.title) setTitleValue(currentResume.meta.title)
  }, [currentResume?.meta?.title])

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  const sectionGroups = [
    {
      label: 'Basics',
      sections: [
        { id: 'target',   label: 'Job Target',    icon: '🎯' },
        { id: 'personal', label: 'Personal Info',  icon: '👤' },
        { id: 'summary',  label: 'Summary',        icon: '📝' },
      ]
    },
    {
      label: 'Experience',
      sections: [
        { id: 'experience',     label: 'Experience',     icon: '💼' },
        { id: 'education',      label: 'Education',      icon: '🎓' },
        { id: 'skills',         label: 'Skills',         icon: '⚡' },
        { id: 'projects',       label: 'Projects',       icon: '🚀' },
      ]
    },
    {
      label: 'Extra',
      sections: [
        { id: 'certifications', label: 'Certifications', icon: '📜' },
        { id: 'languages',      label: 'Languages',      icon: '🌐' },
        { id: 'awards',         label: 'Awards',         icon: '🏆' },
      ]
    },
    {
      label: 'Optimize',
      sections: [
        { id: 'ats',       label: 'Tailor to Job',  icon: '🎯' },
        { id: 'customize', label: 'Customize',       icon: '🎨' },
      ]
    }
  ]

  const allSections = sectionGroups.flatMap(g => g.sections)
  const selectedTemplate = currentResume?.meta?.template || 'modern'

  const handleDownload = () => setShowPreviewModal(true)

  const handleConfirmDownload = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: currentResume, template: selectedTemplate })
      })
      if (!response.ok) throw new Error('Failed to generate PDF')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${titleValue || 'resume'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      setShowPreviewModal(false)
    } catch (error) {
      console.error('Download error:', error)
      throw new Error('Failed to generate PDF. Please make sure the server is running on port 3001.')
    }
  }

  const handleAutoFill = async () => {
    if (demoDataLoading) return; // Prevent multiple clicks
    
    try {
      setDemoDataLoading(true);
      
      // Clear all existing demo-fillable sections first to prevent duplicates
      // Remove all existing links
      if (currentResume.personalInfo?.links?.length > 0) {
        currentResume.personalInfo.links.forEach(link => removeLink(link.id))
      }
      
      // Remove all existing skills
      if (currentResume.skills?.length > 0) {
        currentResume.skills.forEach(skill => removeSkill(skill.id))
      }
      
      // Remove all existing experience
      if (currentResume.experience?.length > 0) {
        currentResume.experience.forEach(exp => removeExperience(exp.id))
      }
      
      // Remove all existing education
      if (currentResume.education?.length > 0) {
        currentResume.education.forEach(edu => removeEducation(edu.id))
      }

      // Remove all existing projects
      if (currentResume.projects?.length > 0) {
        currentResume.projects.forEach(proj => removeItem('projects', proj.id))
      }

      // Remove all existing certifications
      if (currentResume.certifications?.length > 0) {
        currentResume.certifications.forEach(cert => removeItem('certifications', cert.id))
      }

      // Remove all existing languages
      if (currentResume.languages?.length > 0) {
        currentResume.languages.forEach(lang => removeItem('languages', lang.id))
      }

      // Remove all existing awards
      if (currentResume.awards?.length > 0) {
        currentResume.awards.forEach(award => removeItem('awards', award.id))
      }
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now add fresh demo data
      updatePersonalInfo({ fullName: 'Alex Johnson', email: 'alex@example.com', phone: '(555) 123-4567', address: 'San Francisco, CA' })
      addLink({ label: 'LinkedIn', url: 'linkedin.com/in/alexjohnson' })
      addLink({ label: 'GitHub', url: 'github.com/alexjohnson' })
      addLink({ label: 'Portfolio', url: 'alexjohnson.dev' })
      
      updateProfessionalInfo({ jobTitle: 'Senior Product Designer', industry: 'Technology', yearsExperience: '6+', seniority: 'senior', keyAchievements: 'Led design of products used by 2M+ users' })
      
      updateSummary('Results-driven Senior Product Designer with 6+ years crafting intuitive digital experiences. Proven track record of increasing user engagement and driving business outcomes through thoughtful design.')
      
      // Skills (7 items)
      addSkill({ name: 'Figma', category: 'Design', level: 'Expert' })
      addSkill({ name: 'User Research', category: 'Design', level: 'Expert' })
      addSkill({ name: 'Prototyping', category: 'Design', level: 'Advanced' })
      addSkill({ name: 'Design Systems', category: 'Design', level: 'Advanced' })
      addSkill({ name: 'Wireframing', category: 'Design', level: 'Expert' })
      addSkill({ name: 'Accessibility (A11y)', category: 'Design', level: 'Advanced' })
      addSkill({ name: 'Communication', category: 'Soft Skills', level: 'Expert' })
      
      // Experience
      addExperience({ jobTitle: 'Senior Product Designer', company: 'Acme Corp', location: 'San Francisco, CA', startDate: '2021-03', endDate: 'Present', current: true, bullets: [{ id: 'b1', text: 'Led redesign of core product, increasing DAU by 38%.' }, { id: 'b2', text: 'Managed design system used across 4 product teams.' }] })
      addExperience({ jobTitle: 'Product Designer', company: 'StartupXYZ', location: 'San Francisco, CA', startDate: '2019-06', endDate: '2021-02', current: false, bullets: [{ id: 'b3', text: 'Designed mobile app used by 500K+ users.' }, { id: 'b4', text: 'Collaborated with engineering to implement design system.' }] })
      
      // Education
      addEducation({ degree: 'B.F.A. Graphic Design', school: 'Rhode Island School of Design', location: 'Providence, RI', startDate: '2014-09', endDate: '2018-05', description: 'Graduated with honors.' })
      
      // Projects
      addItem('projects', { name: 'Design System Overhaul', description: 'Led comprehensive redesign of company design system, improving developer productivity by 45%', link: 'github.com/alexjohnson/design-system', technologies: 'Figma, React, CSS' })
      addItem('projects', { name: 'Mobile App Redesign', description: 'Complete UX overhaul of flagship mobile app resulting in 3.2x engagement increase', link: 'alexjohnson.dev/mobile-app', technologies: 'Figma, User Research' })
      
      // Certifications
      addItem('certifications', { name: 'Nielsen Norman UX Certification', issuer: 'Nielsen Norman Group', date: '2022-06' })
      addItem('certifications', { name: 'Google UX Design Certificate', issuer: 'Google', date: '2021-12' })
      
      // Languages
      addItem('languages', { name: 'English', proficiency: 'Native' })
      addItem('languages', { name: 'Spanish', proficiency: 'Fluent' })
      
      // Awards
      addItem('awards', { title: 'Design Excellence Award', issuer: 'Acme Corp', date: '2023-05' })
      addItem('awards', { title: 'Innovation in UX', issuer: 'Tech Industry Awards', date: '2022-11' })
      
      // Auto-navigate to summary to show the filled data
      setActiveSection('summary')
      
      setDemoDataLoading(false);
    } catch (error) {
      console.error('Error loading demo data:', error)
      setDemoDataLoading(false);
    }
  }

  const handleTitleChange = () => {
    setIsEditingTitle(false)
    // updateMeta({ title: titleValue }) — wire to your useResume hook
  }

  const sectionContent = (id) => {
    if (!resume) return false
    const map = {
      personal: resume.personalInfo?.fullName,
      summary: resume.summary,
      experience: resume.experience?.length > 0,
      education: resume.education?.length > 0,
      skills: resume.skills?.length > 0,
      projects: resume.projects?.length > 0,
      certifications: resume.certifications?.length > 0,
      languages: resume.languages?.length > 0,
      awards: resume.awards?.length > 0,
    }
    return !!map[id]
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden font-sans"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        .editor-sidebar { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
        .editor-sidebar::-webkit-scrollbar { width: 3px; }
        .editor-sidebar::-webkit-scrollbar-track { background: transparent; }
        .editor-sidebar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        .form-panel { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
        .form-panel::-webkit-scrollbar { width: 4px; }
        .form-panel::-webkit-scrollbar-track { background: transparent; }
        .form-panel::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        .section-transition { animation: slideIn 0.2s ease both; }
        @keyframes slideIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .btn-primary { background: #4f46e5; color: white; transition: all 0.2s; }
        .btn-primary:hover { background: #4338ca; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79,70,229,0.35); }
        .btn-ghost { transition: all 0.15s; }
        .btn-ghost:hover { background: rgba(0,0,0,0.05); }
        .template-chip { transition: all 0.15s; }
        .template-chip:hover { background: #f1f5f9; }
        /* hide preview col on small screens */
        .preview-col { display: flex; }
        @media (max-width: 1023px) { .preview-col { display: none; } }
        @media (max-width: 1023px) { .mobile-tabbar { display: flex !important; } }
        .mobile-tabbar { display: none; }
      `}</style>

      {/* ══ HEADER ══ */}
      <header className="flex-shrink-0 bg-white border-b border-slate-100 z-40">
        <div className="flex items-center h-14 px-3 gap-2">

          {/* Back + Logo */}
          <button
            onClick={goToDashboard}
            className="btn-ghost flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl text-slate-600 hover:text-slate-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="hidden sm:block text-xs font-semibold text-slate-500">Dashboard</span>
          </button>

          <span className="text-slate-200">/</span>

          {/* Editable title */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={titleValue}
                onChange={e => setTitleValue(e.target.value)}
                onBlur={handleTitleChange}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') handleTitleChange() }}
                className="text-sm font-semibold text-slate-900 bg-slate-50 border border-indigo-300 ring-2 ring-indigo-100 rounded-lg px-2 py-1 focus:outline-none min-w-0 max-w-[200px]"
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition-all max-w-[200px] truncate"
                title="Click to rename"
              >
                <span className="truncate">{titleValue || resume?.meta?.title || 'Untitled Resume'}</span>
                <svg className="w-3 h-3 text-slate-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>

          {/* Template chip */}
          <button
            onClick={() => setShowTemplateGallery(true)}
            className="template-chip hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600"
          >
            <span className="text-indigo-500">◈</span>
            <span className="capitalize">{selectedTemplate}</span>
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <SaveBadge status={saveStatus} />

            <button
              onClick={handleAutoFill}
              disabled={demoDataLoading}
              className={`btn-ghost hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                demoDataLoading
                  ? 'opacity-60 cursor-not-allowed text-slate-400 border-slate-200'
                  : 'text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
              title={demoDataLoading ? 'Loading demo data...' : 'Fill form with sample data'}
            >
              <svg className={`w-3.5 h-3.5 ${demoDataLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {demoDataLoading ? 'Loading...' : 'Demo data'}
            </button>

            <button
              onClick={() => setShowTemplateGallery(true)}
              className="btn-ghost md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 border border-slate-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>

            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:block">Export PDF</span>
            </button>
          </div>
        </div>

        {/* Save progress strip */}
        <div className="h-0.5 bg-slate-100">
          {saveStatus === 'saving' && <div className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 animate-pulse w-full" />}
          {saveStatus === 'saved'  && <div className="h-full bg-emerald-400 w-full transition-all duration-500" />}
        </div>
      </header>

      {/* ══ 3-COLUMN BODY ══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── COL 1: SECTIONS SIDEBAR ── */}
        <aside
          className={`flex-shrink-0 bg-white border-r border-slate-100 flex flex-col transition-all duration-300 overflow-hidden ${
            sidebarCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-52'
          }`}
        >
          <div className="flex items-center px-3 pt-4 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sections</span>
          </div>

          <nav className="editor-sidebar flex-1 overflow-y-auto px-2 pb-4 space-y-4">
            {sectionGroups.map(group => (
              <SectionGroup key={group.label} label={group.label}>
                {group.sections.map(section => (
                  <SectionNavItem
                    key={section.id}
                    section={section}
                    isActive={activeSection === section.id}
                    onClick={() => setActiveSection(section.id)}
                    hasContent={sectionContent(section.id)}
                  />
                ))}
              </SectionGroup>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-slate-100">
            <div className="bg-indigo-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">✦</span>
                <span className="text-xs font-bold text-indigo-700">AI Tips</span>
              </div>
              <p className="text-[11px] text-indigo-600 leading-relaxed">
                Use <span className="font-semibold">Tailor to Job</span> to boost your ATS score.
              </p>
            </div>
          </div>
        </aside>

        {/* ── COL 2: FORM PANEL ── */}
        <div className="flex flex-col flex-1 min-w-0 lg:max-w-[480px] xl:max-w-[520px] bg-white border-r border-slate-100">

          {/* Form topbar */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-white">
            <button
              onClick={() => setSidebarCollapsed(p => !p)}
              className="btn-ghost flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? 'M4 6h16M4 12h16M4 18h16' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} />
              </svg>
            </button>

            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-base">{allSections.find(s => s.id === activeSection)?.icon}</span>
              <span className="text-sm font-bold text-slate-800 truncate">
                {allSections.find(s => s.id === activeSection)?.label}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {(() => {
                const idx = allSections.findIndex(s => s.id === activeSection)
                return (
                  <>
                    <button
                      onClick={() => idx > 0 && setActiveSection(allSections[idx - 1].id)}
                      disabled={idx === 0}
                      className="btn-ghost flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => idx < allSections.length - 1 && setActiveSection(allSections[idx + 1].id)}
                      disabled={idx === allSections.length - 1}
                      className="btn-ghost flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Form content */}
          <div className="form-panel flex-1 overflow-y-auto">
            <div className="px-5 py-5 section-transition" key={activeSection}>
              <ResumeForm
                resume={currentResume}
                resumes={resumes}
                activeResumeId={activeResumeId}
                setActiveResumeId={setActiveResumeId}
                createResume={createResume}
                deleteResume={deleteResume}
                duplicateResume={duplicateResume}
                updatePersonalInfo={updatePersonalInfo}
                updateProfessionalInfo={updateProfessionalInfo}
                updateSummary={updateSummary}
                addSkill={addSkill}
                updateSkill={updateSkill}
                removeSkill={removeSkill}
                addExperience={addExperience}
                updateExperience={updateExperience}
                removeExperience={removeExperience}
                addEducation={addEducation}
                updateEducation={updateEducation}
                removeEducation={removeEducation}
                addLink={addLink}
                updateLink={updateLink}
                removeLink={removeLink}
                addItem={addItem}
                updateItem={updateItem}
                removeItem={removeItem}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                sections={allSections}
                updateTheme={updateTheme}
                updateSectionConfig={updateSectionConfig}
                toggleSectionVisibility={toggleSectionVisibility}
                renameSection={renameSection}
                reorderSections={reorderSections}
              />
            </div>
          </div>

          {/* Form footer */}
          <div className="flex-shrink-0 px-5 py-3 border-t border-slate-100 bg-white">
            {(() => {
              const idx = allSections.findIndex(s => s.id === activeSection)
              const next = allSections[idx + 1]
              return next ? (
                <button
                  onClick={() => setActiveSection(next.id)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-700 transition-all duration-200 group"
                >
                  <span>Next: {next.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{next.icon}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold text-white shadow-md shadow-indigo-100 transition-all hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export as PDF
                </button>
              )
            })()}
          </div>
        </div>

        {/* ── COL 3: LIVE PREVIEW PANEL ── */}
        <div
          className="preview-panel flex-1 flex flex-col overflow-hidden bg-white"
          style={{
            backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }}
        >
          {/* Preview topbar */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/70"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400/70"></div>
              </div>
              <span className="text-xs font-medium text-slate-500 ml-1">Live Preview</span>
            </div>
            
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                title="Previous page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-300 rounded-lg px-2.5 py-1">
                <span className="font-semibold">{currentPage}</span>
                <span className="text-slate-400">/</span>
                <span className="font-semibold">{totalPages}</span>
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                title="Next page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Real-time
              </div>
              <button
                onClick={() => setShowTemplateGallery(true)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg px-2.5 py-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Change template
              </button>
            </div>
          </div>

          {/* EditorPreview — takes ALL remaining height, no padding, no wrapper */}
          <div className="flex-1 min-h-0">
            <EditorPreview
              resume={currentResume}
              template={selectedTemplate}
              onTemplateChange={updateTemplate}
              showTemplateGallery={showTemplateGallery}
              setShowTemplateGallery={setShowTemplateGallery}
              TemplateGallery={TemplateGallery}
              currentPage={currentPage}
              onPageCountChange={setTotalPages}
            />
          </div>
        </div>
      </div>

      {/* ══ MOBILE TAB BAR ══ */}
      <div className="mobile-tabbar lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 items-stretch">
        {[
          { id: 'edit', label: 'Edit', icon: (a) => (
            <svg className="w-5 h-5 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 2.5 : 2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          )},
          { id: 'preview', label: 'Preview', icon: (a) => (
            <svg className="w-5 h-5 mx-auto mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 2.5 : 2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 2.5 : 2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )},
        ].map(tab => {
          const active = mobileView === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setMobileView(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 text-[11px] font-semibold transition-colors ${
                active ? 'text-indigo-600 bg-indigo-50/60 border-t-2 border-indigo-600' : 'text-slate-500'
              }`}
            >
              {tab.icon(active)}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ══ PDF MODAL ══ */}
      <PDFPreviewModal
        isOpen={showPreviewModal}
        resume={currentResume}
        template={selectedTemplate}
        onConfirm={handleConfirmDownload}
        onCancel={() => setShowPreviewModal(false)}
      />
    </div>
  )
}

export default EditorPage