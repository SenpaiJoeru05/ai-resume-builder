import { useState, useEffect } from 'react'
import { useRouting } from '../../hooks/useRouting'
import { useResume } from '../../hooks/useResume'
import { Button } from '../../components/shared/Button'
import { TemplateSelection } from '../../components/creation/TemplateSelection'
import { JobTargetSetup } from '../../components/creation/JobTargetSetup'
import { PersonalInfoSetup } from '../../components/creation/PersonalInfoSetup'
import { ProgressIndicator } from '../../components/creation/ProgressIndicator'

const STEPS = ['Template', 'Job Target', 'Personal Info', 'Review']

const DEMO_DATA = {
  template: 'modern',
  jobTarget: {
    jobTitle: 'Senior Full Stack Developer',
    industry: 'Technology / Software',
    yearsExperience: '5-7',
    seniority: 'senior',
    jobDescription: 'Looking for experienced full stack developers with React, Node.js, and AWS expertise',
    tone: 'professional',
  },
  personalInfo: {
    fullName: 'Joel Rayton',
    email: 'joel.rayton@email.com',
    phone: '+1 (555) 123-4567',
    address: 'San Francisco, CA',
    links: [
      { id: 'link-1', label: 'LinkedIn', url: 'linkedin.com/in/johnanderson' },
      { id: 'link-2', label: 'GitHub', url: 'github.com/johnanderson' },
      { id: 'link-3', label: 'Portfolio', url: 'johnanderson.dev' },
    ],
  },
}

export function CreateFromScratch() {
  const { goToDashboard, goToEditor } = useRouting()
  const { createResumeWithData, resumes, flushStorage } = useResume()
  const [currentStep, setCurrentStep] = useState(1)
  const [scrolled, setScrolled] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)
  const [formData, setFormData] = useState({
    template: 'modern',
    jobTarget: {
      jobTitle: '',
      industry: '',
      yearsExperience: '',
      seniority: '',
      jobDescription: '',
      tone: 'professional',
    },
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      links: [],
    },
  })

  // Watch for new resume creation and navigate when it appears
  useEffect(() => {
    if (pendingNavigation && resumes.some(r => r.meta.id === pendingNavigation)) {
      // Flush storage to ensure EditorPage can load the resume from localStorage
      flushStorage()
      // Small delay to ensure flush completes before navigation
      setTimeout(() => {
        goToEditor(pendingNavigation)
        setPendingNavigation(null)
      }, 50)
    }
  }, [pendingNavigation, resumes, goToEditor, flushStorage])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      // Create resume with all form data in one call
      const newResume = createResumeWithData('New Resume', {
        template: formData.template,
        personalInfo: formData.personalInfo,
        professionalInfo: formData.jobTarget, // jobTarget maps to professionalInfo
      })
      
      // Store ID for navigation - useEffect will handle navigation when resume appears in state
      setPendingNavigation(newResume.meta.id)
    } catch (error) {
      console.error('Error creating resume:', error)
      alert('Failed to create resume. Please try again.')
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.template
      case 2:
        return !!formData.jobTarget.jobTitle && !!formData.jobTarget.industry
      case 3:
        return !!formData.personalInfo.fullName && !!formData.personalInfo.email
      default:
        return true
    }
  }

  const handleLoadDemoData = () => {
    setFormData(DEMO_DATA)
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
              <span className="text-sm font-medium text-slate-600">Create Resume</span>
            </div>
          </div>
          <button onClick={goToDashboard} className="text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button 
            onClick={handleLoadDemoData}
            className="ml-3 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Load demo data for testing"
          >
            📋 Demo
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
                Create Your Resume
              </h1>
              <p className="text-indigo-200 text-sm max-w-2xl">
                Build a professional, ATS-optimized resume in minutes. Follow the guided steps below to get started.
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
              <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Choose Your Template</h2>
              <p className="text-slate-600 mb-6">Select a professional template that matches your style</p>
              <TemplateSelection
                selectedTemplate={formData.template}
                onSelect={(template) => setFormData({ ...formData, template })}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Target Job</h2>
              <p className="text-slate-600 mb-6">Tell us about the job you're targeting to optimize your resume</p>
              <JobTargetSetup
                data={formData.jobTarget}
                onChange={(jobTarget) => setFormData({ ...formData, jobTarget })}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Your Information</h2>
              <p className="text-slate-600 mb-6">Add your personal details to get started</p>
              <PersonalInfoSetup
                data={formData.personalInfo}
                onChange={(personalInfo) => setFormData({ ...formData, personalInfo })}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Review Your Setup</h2>
                <p className="text-slate-600">Confirm your choices before creating your resume</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4 border border-indigo-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <h3 className="font-bold text-slate-900">Template</h3>
                  </div>
                  <p className="text-slate-700 capitalize font-medium">{formData.template}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <h3 className="font-bold text-slate-900">Position</h3>
                  </div>
                  <p className="text-slate-700 font-medium">{formData.jobTarget.jobTitle}</p>
                  <p className="text-sm text-slate-600">{formData.jobTarget.industry}</p>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-4 border border-violet-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-violet-600 rounded-full"></div>
                    <h3 className="font-bold text-slate-900">Name</h3>
                  </div>
                  <p className="text-slate-700 font-medium">{formData.personalInfo.fullName}</p>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 rounded-xl p-4 border border-rose-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-rose-600 rounded-full"></div>
                    <h3 className="font-bold text-slate-900">Email</h3>
                  </div>
                  <p className="text-slate-700 font-medium text-sm">{formData.personalInfo.email}</p>
                </div>
              </div>
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
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 p-4 flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Pro Tip</p>
            <p className="text-sm text-blue-800 mt-0.5">The more accurate information you provide, the better our AI can optimize your resume for the job you want.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
