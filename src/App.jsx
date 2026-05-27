import { useState } from 'react'
import { useResume } from './hooks/useResume'
import { ResumeForm } from './components/ResumeForm'
import { ResumePreview } from './components/ResumePreview'
import { Sidebar } from './components/Sidebar'
import { exportResumePDF } from './utils/pdfExport'
import './App.css'

function App() {
  const resume = useResume()
  const [activeSection, setActiveSection] = useState('personal')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('modern')

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
  ]

  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: resume.resume,
          template: selectedTemplate
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF. Please make sure the server is running on port 3001.');
    }
  }

  const handleAutoFill = () => {
    // Personal Info
    resume.updatePersonalInfo({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      address: '123 Main Street, City, State 12345'
    })

    // Professional Info
    resume.updateProfessionalInfo({
      jobTitle: 'Senior Software Engineer',
      industry: 'Technology',
      yearsExperience: '5+',
      keyAchievements: 'Led development of enterprise applications serving 1M+ users'
    })

    // Summary
    resume.updateSummary('Results-driven Senior Software Engineer with 5+ years of experience in full-stack development. Proven track record of delivering high-quality, scalable solutions. Expert in React, Node.js, and cloud technologies. Passionate about clean code and mentoring junior developers.')

    // Skills
    const dummySkills = ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile', 'REST APIs', 'GraphQL']
    dummySkills.forEach(skill => resume.addSkill(skill))

    // Experience
    const dummyExperience = [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Corp Inc.',
        location: 'San Francisco, CA',
        startDate: '2021-01',
        endDate: 'Present',
        description: 'Led development of microservices architecture, improved system performance by 40%. Mentored team of 5 junior developers.'
      },
      {
        title: 'Software Engineer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        startDate: '2019-06',
        endDate: '2020-12',
        description: 'Developed and maintained web applications using React and Node.js. Implemented CI/CD pipelines reducing deployment time by 60%.'
      }
    ]
    dummyExperience.forEach(exp => resume.addExperience(exp))

    // Education
    const dummyEducation = [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of Technology',
        location: 'Boston, MA',
        startDate: '2015-09',
        endDate: '2019-05',
        description: 'Graduated with honors. GPA: 3.8/4.0'
      }
    ]
    dummyEducation.forEach(edu => resume.addEducation(edu))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AI Resume Builder</h1>
                <p className="text-slate-600 text-sm mt-0.5">Create professional resumes with AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="modern">Modern Template</option>
                <option value="classic">Classic Template</option>
                <option value="minimal">Minimal Template</option>
              </select>
              <button
                onClick={handleAutoFill}
                className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Auto Fill
              </button>
              <button
                onClick={handleDownload}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition flex items-center gap-2 shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-73px)]">
        {/* Left Container: Sidebar + Form */}
        <div className="w-1/2 flex">
          {/* Sidebar */}
          <Sidebar
            sections={sections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />

          {/* Form Content */}
          <div className="flex-1 transition-all duration-300 overflow-y-auto">
            <div className="px-6 py-6">
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
        </div>

        {/* Preview Panel */}
        <div className="hidden xl:flex w-1/2 border-l border-slate-200 bg-slate-100 flex-col overflow-hidden print:block print:flex-none print:w-full print:border-none print:bg-white">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 print:hidden z-10">
            <h2 className="text-lg font-semibold text-slate-900">Live Preview</h2>
          </div>
          <div className="flex-1 overflow-auto flex justify-center items-start py-6">
            <div id="resume-preview" className="bg-white shadow-2xl print:shadow-none print:rounded-none print:p-0 flex-shrink-0 print:w-full relative" style={{ width: '794px', minHeight: '1123px', transform: 'scale(0.9)', transformOrigin: 'top center' }}>
              <ResumePreview resume={resume.resume} template={selectedTemplate} />
              {/* Live Preview Page Number */}
              <div className="absolute bottom-4 right-6 text-sm text-gray-500 print:hidden">
                Page 1
              </div>
            </div>
          </div>
          {/* Print Footer with Page Number */}
          <div className="print-footer hidden print:block">
            Page <span className="page-number"></span>
          </div>
        </div>
      </main>

      {/* Mobile Preview Toggle */}
      <div className="xl:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => document.getElementById('mobile-preview')?.classList.toggle('hidden')}
          className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>

      {/* Mobile Preview Modal */}
      <div
        id="mobile-preview"
        className="hidden xl:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Live Preview</h2>
            <button
              onClick={() => document.getElementById('mobile-preview')?.classList.add('hidden')}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <ResumePreview resume={resume.resume} template={selectedTemplate} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
