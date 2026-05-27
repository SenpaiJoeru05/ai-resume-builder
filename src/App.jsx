import { useState } from 'react'
import { useResume } from './hooks/useResume'
import { ResumeForm } from './components/ResumeForm'
import { ResumePreview } from './components/ResumePreview'
import { Sidebar } from './components/Sidebar'
import { exportResumePDF } from './utils/pdfExport'
import './App.css'

// Import pdfmake and set up fonts
import pdfMake from 'pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

pdfMake.vfs = pdfFonts

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
    const getDocDefinition = () => {
      const baseStyles = {
        modern: {
          header: { fontSize: 24, bold: true, color: '#1e293b', font: 'Helvetica' },
          contact: { fontSize: 10, color: '#64748b', font: 'Helvetica' },
          sectionHeader: { fontSize: 10, bold: true, color: '#2563eb', letterSpacing: 1.5, margin: [0, 10, 0, 5], font: 'Helvetica' },
          jobTitle: { fontSize: 12, bold: true, color: '#1e293b', font: 'Helvetica' },
          company: { fontSize: 10, bold: true, color: '#64748b', font: 'Helvetica' },
          date: { fontSize: 9, color: '#64748b', font: 'Helvetica' },
          body: { fontSize: 9, color: '#334155', lineHeight: 1.4, font: 'Helvetica' },
          skillBadge: { fontSize: 8, color: '#1d4ed8', background: '#eff6ff', margin: [0, 2, 0, 2], font: 'Helvetica' }
        },
        classic: {
          header: { fontSize: 24, bold: true, color: '#1e293b', alignment: 'center', font: 'Times' },
          contact: { fontSize: 10, color: '#374151', alignment: 'center', font: 'Times' },
          sectionHeader: { fontSize: 10, bold: true, color: '#1e293b', decoration: 'underline', margin: [0, 10, 0, 5], font: 'Times' },
          jobTitle: { fontSize: 12, bold: true, color: '#1e293b', font: 'Times' },
          company: { fontSize: 10, italics: true, color: '#374151', font: 'Times' },
          date: { fontSize: 9, color: '#4b5563', font: 'Times' },
          body: { fontSize: 9, color: '#374151', lineHeight: 1.4, alignment: 'justify', font: 'Times' },
          skillBadge: { fontSize: 9, color: '#374151', font: 'Times' }
        },
        minimal: {
          header: { fontSize: 20, bold: false, color: '#1e293b', letterSpacing: 1, font: 'Helvetica' },
          contact: { fontSize: 8, color: '#6b7280', letterSpacing: 1, textTransform: 'uppercase', font: 'Helvetica' },
          sectionHeader: { fontSize: 9, bold: true, color: '#1e293b', margin: [0, 8, 0, 4], font: 'Helvetica' },
          jobTitle: { fontSize: 11, bold: true, color: '#1e293b', font: 'Helvetica' },
          company: { fontSize: 9, color: '#6b7280', font: 'Helvetica' },
          date: { fontSize: 8, color: '#9ca3af', font: 'Helvetica' },
          body: { fontSize: 9, color: '#374151', lineHeight: 1.4, bold: false, font: 'Helvetica' },
          skillBadge: { fontSize: 8, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, font: 'Helvetica' }
        }
      }

      const styles = baseStyles[selectedTemplate] || baseStyles.modern

      const content = []

      // Header with blue line for modern
      if (selectedTemplate === 'modern') {
        content.push({ text: resume.resume.personalInfo.fullName || 'Your Name', style: 'header', margin: [0, 0, 0, 10] })
        content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 500, y2: 0, lineWidth: 2, lineColor: '#2563eb' }], margin: [0, 0, 0, 10] })
        content.push({
          text: [resume.resume.personalInfo.email, ' | ', resume.resume.personalInfo.phone, ' | ', resume.resume.personalInfo.address].filter(Boolean),
          style: 'contact',
          margin: [0, 0, 0, 20]
        })
      } else if (selectedTemplate === 'classic') {
        content.push({ text: resume.resume.personalInfo.fullName || 'Your Name', style: 'header', margin: [0, 0, 0, 10] })
        content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 500, y2: 0, lineWidth: 2, lineColor: '#1e293b' }], margin: [0, 0, 0, 10] })
        content.push({
          text: [resume.resume.personalInfo.email, ' | ', resume.resume.personalInfo.phone, ' | ', resume.resume.personalInfo.address].filter(Boolean),
          style: 'contact',
          margin: [0, 0, 0, 20]
        })
      } else {
        content.push({ text: resume.resume.personalInfo.fullName || 'Your Name', style: 'header', margin: [0, 0, 0, 8] })
        content.push({
          text: [resume.resume.personalInfo.email, ' • ', resume.resume.personalInfo.phone, ' • ', resume.resume.personalInfo.address].filter(Boolean),
          style: 'contact',
          margin: [0, 0, 0, 16]
        })
      }

      // Summary
      if (resume.resume.summary) {
        if (selectedTemplate !== 'minimal') {
          content.push({ text: 'PROFESSIONAL SUMMARY', style: 'sectionHeader' })
        }
        content.push({ text: resume.resume.summary, style: 'body', margin: [0, 0, 0, 10] })
      }

      // Experience
      if (resume.resume.experience.length > 0) {
        if (selectedTemplate !== 'minimal') {
          content.push({ text: 'EXPERIENCE', style: 'sectionHeader' })
        }
        resume.resume.experience.forEach(exp => {
          content.push({
            stack: [
              {
                columns: [
                  { text: exp.title, style: 'jobTitle', width: '70%' },
                  { text: `${exp.startDate} - ${exp.endDate}`, style: 'date', width: '30%', alignment: 'right' }
                ]
              },
              { text: exp.company, style: 'company', margin: [0, 2, 0, 0] },
              exp.description && { text: exp.description, style: 'body', margin: [0, 4, 0, 0] }
            ],
            margin: [0, 0, 0, 12]
          })
        })
      }

      // Education
      if (resume.resume.education.length > 0) {
        if (selectedTemplate !== 'minimal') {
          content.push({ text: 'EDUCATION', style: 'sectionHeader' })
        }
        resume.resume.education.forEach(edu => {
          content.push({
            stack: [
              {
                columns: [
                  { text: edu.degree, style: 'jobTitle', width: '70%' },
                  edu.graduationDate && { text: edu.graduationDate, style: 'date', width: '30%', alignment: 'right' }
                ].filter(Boolean)
              },
              { text: edu.school, style: 'company', margin: [0, 2, 0, 0] },
              edu.field && { text: `Field of Study: ${edu.field}`, style: 'body', margin: [0, 2, 0, 0] }
            ],
            margin: [0, 0, 0, 12]
          })
        })
      }

      // Skills with boxes for modern
      if (resume.resume.skills.length > 0) {
        if (selectedTemplate !== 'minimal') {
          content.push({ text: 'SKILLS', style: 'sectionHeader' })
        }
        if (selectedTemplate === 'modern') {
          content.push({
            text: resume.resume.skills.map(skill => ({
              text: skill.name,
              style: 'skillBadge',
              background: '#eff6ff',
              color: '#1d4ed8',
              margin: [0, 2, 0, 2],
              decoration: 'none'
            })),
            margin: [0, 0, 0, 8]
          })
        } else if (selectedTemplate === 'classic') {
          content.push({ text: resume.resume.skills.map(skill => skill.name).join(' • '), style: 'body' })
        } else {
          content.push({ text: resume.resume.skills.map(skill => skill.name).join(' / '), style: 'skillBadge' })
        }
      }

      return {
        content,
        styles,
        pageMargins: [72, 36, 72, 72],
        pageSize: 'LETTER',
        defaultStyle: {
          font: selectedTemplate === 'classic' ? 'Times' : 'Helvetica'
        }
      }
    }

    pdfMake.createPdf(getDocDefinition()).download('resume.pdf')
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
            <div id="resume-preview" className="bg-white shadow-2xl print:shadow-none print:rounded-none print:p-0 flex-shrink-0 print:w-full relative" style={{ width: '794px', minHeight: '1123px' }}>
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
