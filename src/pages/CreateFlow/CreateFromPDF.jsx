import { useState, useEffect, useRef } from 'react'
import { useRouting } from '../../hooks/useRouting'
import { useResume } from '../../hooks/useResume'
import { PDFUpload } from '../../components/creation/PDFUpload'
import { JobTargetSetup } from '../../components/creation/JobTargetSetup'
import { TemplateSelection } from '../../components/creation/TemplateSelection'
import { ProgressIndicator } from '../../components/creation/ProgressIndicator'
import { extractTextFromPDF } from '../../services/pdfExtractService'
import { parseResumeFromPDF } from '../../services/pdfParseService'

const STEPS = ['Upload', 'Review', 'Job Target', 'Template']

export function CreateFromPDF() {
  const { goToDashboard, goToEditor, goToCreateFromScratch } = useRouting()
  const { createResumeWithData, resumes, flushStorage } = useResume()
  const [currentStep, setCurrentStep] = useState(1)
  const [scrolled, setScrolled] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState('')
  const [fileName, setFileName] = useState('')
  const [pageProgress, setPageProgress] = useState(null)
  const [pendingNavigation, setPendingNavigation] = useState(null)
  const [importError, setImportError] = useState(null)
  const [retryNotice, setRetryNotice] = useState(null)
  const [retrySecondsLeft, setRetrySecondsLeft] = useState(0)
  // Held so "Try again" doesn't make the user re-pick the same file.
  const lastFileRef = useRef(null)
  const [formData, setFormData] = useState({
    extractedData: null,
    jobTarget: {
      jobTitle: '',
      industry: '',
      yearsExperience: '',
      seniority: '',
      jobDescription: '',
      tone: 'professional',
    },
    template: 'modern',
  })

  // Ticks the rate-limit countdown. setState inside the interval callback is
  // fine; only a synchronous call in the effect body would cascade renders.
  useEffect(() => {
    if (!retryNotice) return
    const until = retryNotice.startedAt + retryNotice.waitMs
    const id = setInterval(() => {
      setRetrySecondsLeft(Math.max(0, Math.ceil((until - Date.now()) / 1000)))
    }, 250)
    return () => clearInterval(id)
  }, [retryNotice])

  // Hand off to the editor only once the new resume is committed to state AND
  // written to localStorage, since EditorPage rebuilds its own copy from storage
  // on mount. Mirrors the create-from-scratch flow.
  useEffect(() => {
    if (!pendingNavigation) return
    if (!resumes.some((r) => r.meta.id === pendingNavigation)) return

    flushStorage()
    const id = setTimeout(() => {
      goToEditor(pendingNavigation)
      setPendingNavigation(null)
    }, 50)
    return () => clearTimeout(id)
  }, [pendingNavigation, resumes, goToEditor, flushStorage])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleFileUploaded = async (file) => {
    setProcessing(true)
    setFileName(file.name)
    setPageProgress(null)
    setImportError(null)
    setRetryNotice(null)
    lastFileRef.current = file
    try {
      setProcessingStage('read')
      const extractedText = await extractTextFromPDF(file, (p) => {
        setProcessingStage('extract')
        setPageProgress(p)
      })

      setProcessingStage('parse')
      const extractedData = await parseResumeFromPDF(extractedText, {
        // Seeded here (an event callback, not render) so the countdown shows its
        // real starting value instead of flashing 0 before the first tick.
        onRetry: ({ waitMs }) => {
          setRetryNotice({ waitMs, startedAt: Date.now() })
          setRetrySecondsLeft(Math.ceil(waitMs / 1000))
        },
      })
      setRetryNotice(null)

      // The resume already tells us the role this person is positioned for, so
      // pre-fill Job Target from it rather than making them retype it. The job
      // description stays empty on purpose — that describes a role they're
      // applying TO, which can't be known from their own resume.
      const inferred = extractedData.professionalInfo || {}

      setFormData({
        ...formData,
        extractedData,
        jobTarget: {
          ...formData.jobTarget,
          jobTitle: inferred.jobTitle || '',
          industry: inferred.industry || '',
          yearsExperience: inferred.yearsExperience || '',
          seniority: inferred.seniority || '',
        },
      })
      setCurrentStep(2)
    } catch (error) {
      console.error('Error importing PDF:', error)
      // The services already translate provider errors into plain language, so
      // show that rather than a raw API payload.
      setImportError(error.message || 'Something went wrong reading this PDF.')
    } finally {
      setProcessing(false)
      setProcessingStage('')
      setPageProgress(null)
      setRetryNotice(null)
    }
  }

  const handleRetry = () => {
    if (lastFileRef.current) handleFileUploaded(lastFileRef.current)
  }

  // ── Review-step editing of personalInfo.links ────────────────────────────
  // The extractor finds LinkedIn/GitHub/portfolio URLs, but a PDF can bury them
  // in a footer or a text layer that reads out of order, so they need to be
  // visible and correctable here rather than only after the resume exists.
  const patchPersonalInfo = (patch) =>
    setFormData((prev) => ({
      ...prev,
      extractedData: {
        ...prev.extractedData,
        personalInfo: { ...prev.extractedData.personalInfo, ...patch },
      },
    }))

  const extractedLinks = formData.extractedData?.personalInfo?.links || []
  const setLinks = (next) => patchPersonalInfo({ links: next })
  const addLink = () =>
    setLinks([...extractedLinks, { id: `link-${Date.now()}`, label: '', url: '' }])
  const updateLink = (id, patch) =>
    setLinks(extractedLinks.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const removeLink = (id) => setLinks(extractedLinks.filter((l) => l.id !== id))

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      goToDashboard()
    }
  }

  const handleCreate = () => {
    try {
      const data = formData.extractedData || {}
      const fullName = data.personalInfo?.fullName?.trim()
      const resumeTitle = fullName ? `${fullName}'s Resume` : 'Imported Resume'

      // Every section goes in with the resume in a single state update — see the
      // note on createResumeWithData for why the per-section mutators cannot be
      // used here.
      const newResume = createResumeWithData(resumeTitle, {
        template: formData.template,
        personalInfo: {
          ...data.personalInfo,
          // An "Add link" row the user left blank shouldn't be persisted; the
          // preview filters these out anyway, so it would just be dead data
          // they'd have to delete in the editor.
          links: (data.personalInfo?.links || []).filter(
            (l) => (l.url || '').trim() || (l.label || '').trim()
          ),
        },
        professionalInfo: formData.jobTarget,
        summary: data.summary,
        experience: data.experience,
        education: data.education,
        skills: data.skills,
        projects: data.projects,
        certifications: data.certifications,
        languages: data.languages,
        awards: data.awards,
      })

      // Don't navigate yet. Each page calls useResume() independently, so they
      // share nothing but localStorage — and that write is debounced 500ms.
      // Navigating now means EditorPage mounts and reads storage before the new
      // resume is in it, which renders an empty editor. The effect below waits
      // for the resume to land in state, flushes, and only then navigates.
      setPendingNavigation(newResume.meta.id)
    } catch (error) {
      console.error('Error creating resume:', error)
      alert('Failed to create resume. Please try again.')
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return !!formData.extractedData
      case 3:
        return !!formData.jobTarget.jobTitle && !!formData.jobTarget.industry
      case 4:
        return !!formData.template
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        .gradient-text { background: linear-gradient(135deg, #4f46e5 0%, #818cf8 50%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .create-grid { background-image: radial-gradient(circle, #e0e7ff 1px, transparent 1px); background-size: 28px 28px; }
        .step-card { transition: all 0.3s ease; }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-white border-b border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={goToDashboard} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/40">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-slate-900 tracking-tight">ResumeAI</span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm font-medium text-slate-600">Import from PDF</span>
            </div>
          </div>
          <button onClick={goToDashboard} className="text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <div className="pt-16">
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 overflow-hidden">
          <div className="absolute inset-0 create-grid opacity-10 pointer-events-none"></div>
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-violet-500/30 rounded-full blur-3xl"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                Import Your Resume
              </h1>
              <p className="text-indigo-200 text-sm max-w-2xl">
                Upload your existing resume as a PDF, and our AI will extract all the information to get you started instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator 
            currentStep={currentStep}
            totalSteps={STEPS.length}
            steps={STEPS}
          />
        </div>

        {/* Step Content */}
        <div className="step-card bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Upload Your Resume</h2>
              <p className="text-slate-600 mb-6">Select a PDF file from your computer</p>
              {importError && (
                <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-amber-900 mb-1">Couldn&rsquo;t import that resume</p>
                      <p className="text-sm text-amber-800">{importError}</p>
                      {/* An error can only exist after a file was chosen, so the
                          retry target is always present — no need to read the ref
                          during render to decide whether to offer it. */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={handleRetry}
                          className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition"
                        >
                          Try again
                        </button>
                        <button
                          onClick={goToCreateFromScratch}
                          className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition"
                        >
                          Build from scratch instead
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <PDFUpload
                onFileUploaded={handleFileUploaded}
                processing={processing}
                processingStage={processingStage}
                fileName={fileName}
                pageProgress={pageProgress}
                retrySecondsLeft={retrySecondsLeft}
              />
            </div>
          )}

          {currentStep === 2 && formData.extractedData && (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Review Extracted Data</h2>
                <p className="text-slate-600">Review and edit the information extracted from your PDF. You can fine-tune details here.</p>
              </div>

              <div className="space-y-4">
                {/* Personal Information */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={formData.extractedData.personalInfo.fullName}
                        onChange={(e) => setFormData({
                          ...formData,
                          extractedData: {
                            ...formData.extractedData,
                            personalInfo: {
                              ...formData.extractedData.personalInfo,
                              fullName: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Email</label>
                      <input
                        type="email"
                        value={formData.extractedData.personalInfo.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          extractedData: {
                            ...formData.extractedData,
                            personalInfo: {
                              ...formData.extractedData.personalInfo,
                              email: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={formData.extractedData.personalInfo.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          extractedData: {
                            ...formData.extractedData,
                            personalInfo: {
                              ...formData.extractedData.personalInfo,
                              phone: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">Address</label>
                      <input
                        type="text"
                        value={formData.extractedData.personalInfo.address}
                        onChange={(e) => setFormData({
                          ...formData,
                          extractedData: {
                            ...formData.extractedData,
                            personalInfo: {
                              ...formData.extractedData.personalInfo,
                              address: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* Links — LinkedIn, GitHub, portfolio, etc. */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Links
                        </label>
                        <button
                          type="button"
                          onClick={addLink}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                        >
                          + Add link
                        </button>
                      </div>

                      {extractedLinks.length === 0 ? (
                        <p className="text-xs text-slate-500 bg-white border border-dashed border-slate-300 rounded-lg px-3 py-2.5">
                          No links found in your PDF. Add your LinkedIn, GitHub or portfolio &mdash;
                          recruiters look for them.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {extractedLinks.map((link) => (
                            <div key={link.id} className="flex gap-2">
                              <input
                                type="text"
                                value={link.label || ''}
                                onChange={(e) => updateLink(link.id, { label: e.target.value })}
                                placeholder="LinkedIn"
                                aria-label="Link name"
                                className="w-1/3 min-w-0 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                              />
                              <input
                                type="text"
                                value={link.url || ''}
                                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                                placeholder="linkedin.com/in/you"
                                aria-label="Link URL"
                                className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => removeLink(link.id)}
                                aria-label={`Remove ${link.label || 'link'}`}
                                title="Remove"
                                className="flex-shrink-0 px-2.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Professional Summary
                  </h3>
                  <textarea
                    value={formData.extractedData.summary}
                    onChange={(e) => setFormData({
                      ...formData,
                      extractedData: {
                        ...formData.extractedData,
                        summary: e.target.value
                      }
                    })}
                    rows={3}
                    placeholder="No summary found in PDF"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                  />
                </div>

                {/* Experience Preview */}
                {formData.extractedData.experience && formData.extractedData.experience.length > 0 && (
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4m0 0L14 6m2-2l2 2M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Experience ({formData.extractedData.experience.length})
                    </h3>
                    <div className="space-y-2 text-xs">
                      {formData.extractedData.experience.slice(0, 3).map((exp) => (
                        <div key={exp.id} className="bg-white rounded p-2 border border-slate-200">
                          <div className="font-semibold text-slate-900">{exp.jobTitle || 'Job Title'}</div>
                          <div className="text-slate-600">{exp.company || 'Company'}</div>
                        </div>
                      ))}
                      {formData.extractedData.experience.length > 3 && (
                        <div className="text-slate-500 italic">+{formData.extractedData.experience.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Education Preview */}
                {formData.extractedData.education && formData.extractedData.education.length > 0 && (
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17.25c0 5.105 3.07 9.772 7.5 11.855m0-13c5.5 0 10 4.745 10 10.25 0 5.105-3.07 9.772-7.5 11.855" />
                      </svg>
                      Education ({formData.extractedData.education.length})
                    </h3>
                    <div className="space-y-2 text-xs">
                      {formData.extractedData.education.slice(0, 2).map((edu) => (
                        <div key={edu.id} className="bg-white rounded p-2 border border-slate-200">
                          <div className="font-semibold text-slate-900">{edu.degree || 'Degree'}</div>
                          <div className="text-slate-600">{edu.school || 'School'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Preview */}
                {formData.extractedData.skills && formData.extractedData.skills.length > 0 && (
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Skills ({formData.extractedData.skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.extractedData.skills.slice(0, 8).map((skill) => (
                        <span key={skill.id} className="bg-white border border-slate-300 rounded-full px-2.5 py-1 text-xs text-slate-700">
                          {skill.name}
                        </span>
                      ))}
                      {formData.extractedData.skills.length > 8 && (
                        <span className="text-slate-500 text-xs italic">+{formData.extractedData.skills.length - 8} more</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    ℹ️ <strong>Tip:</strong> You can edit all details in the next step after creating the resume. This review is just a quick check.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Target Job</h2>
              <p className="text-slate-600 mb-6">
                We filled these in from your resume &mdash; change anything that doesn&rsquo;t match
                the role you&rsquo;re going after.
              </p>
              <JobTargetSetup
                data={formData.jobTarget}
                onChange={(jobTarget) => setFormData({ ...formData, jobTarget })}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Choose Your Template</h2>
              <p className="text-slate-600 mb-6">Select a professional template that matches your style</p>
              <TemplateSelection
                selectedTemplate={formData.template}
                onSelect={(template) => setFormData({ ...formData, template })}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200"
            >
              {currentStep === 1 ? '← Back to Dashboard' : '← Back'}
            </button>
            
            {currentStep < STEPS.length ? (
              <button 
                onClick={handleNext}
                disabled={!canProceed()}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 hover:-translate-y-0.5"
              >
                Next Step →
              </button>
            ) : (
              <button 
                onClick={handleCreate}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200 hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Resume
              </button>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 p-4 flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">Quick Import</p>
            <p className="text-sm text-amber-800 mt-0.5">Our AI will extract your information and fill in the details automatically. You can review and edit everything in the next steps.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
