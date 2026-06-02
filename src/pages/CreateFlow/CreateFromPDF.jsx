import { useState, useEffect } from 'react'
import { useRouting } from '../../hooks/useRouting'
import { useResume } from '../../hooks/useResume'
import { Button } from '../../components/shared/Button'
import { PDFUpload } from '../../components/creation/PDFUpload'
import { JobTargetSetup } from '../../components/creation/JobTargetSetup'
import { TemplateSelection } from '../../components/creation/TemplateSelection'
import { ProgressIndicator } from '../../components/creation/ProgressIndicator'

const STEPS = ['Upload', 'Review', 'Job Target', 'Template']

export function CreateFromPDF() {
  const { goToDashboard, goToEditor } = useRouting()
  const { createResume } = useResume()
  const [currentStep, setCurrentStep] = useState(1)
  const [scrolled, setScrolled] = useState(false)
  const [processing, setProcessing] = useState(false)
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleFileUploaded = async (file) => {
    setProcessing(true)
    try {
      // Simulate PDF processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate extracted data
      const extractedData = {
        personalInfo: {
          fullName: 'Imported Name',
          email: 'imported@example.com',
          phone: '(555) 123-4567',
          address: '123 Main St, City, State 12345',
          links: [],
        },
        professionalInfo: {
          jobTitle: 'Software Engineer',
          industry: 'Technology',
          yearsExperience: '3+',
          seniority: 'mid',
        },
        summary: 'Experienced software professional with expertise in web development and system architecture.',
      }
      
      setFormData({ 
        ...formData, 
        extractedData,
        jobTarget: {
          ...formData.jobTarget,
          jobTitle: extractedData.professionalInfo.jobTitle || '',
          industry: extractedData.professionalInfo.industry || '',
          yearsExperience: extractedData.professionalInfo.yearsExperience || '',
          seniority: extractedData.professionalInfo.seniority || '',
        }
      })
      setCurrentStep(2)
    } catch (error) {
      console.error('Error importing PDF:', error)
      alert('Failed to import PDF')
    } finally {
      setProcessing(false)
    }
  }

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

  const handleCreate = async () => {
    try {
      const newResume = createResume('Imported Resume')
      // Update the resume with the extracted data
      // This would need to be implemented by calling update functions from useResume
      goToEditor(newResume.meta.id)
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
              <PDFUpload 
                onFileUploaded={handleFileUploaded}
                processing={processing}
              />
            </div>
          )}

          {currentStep === 2 && formData.extractedData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Review Extracted Data</h2>
                <p className="text-slate-600">Review and edit the information extracted from your PDF</p>
              </div>

              <div className="space-y-4">
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
                  </div>
                </div>

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
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Target Job</h2>
              <p className="text-slate-600 mb-6">Tell us about the job you're targeting to optimize your resume</p>
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
