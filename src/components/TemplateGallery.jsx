import { useRef, useState, useEffect } from 'react'
import { ResumePreview } from './ResumePreview'
import { getPageSize } from '../utils/pageSizes'

// Template metadata. The thumbnail itself is a real, scaled-down render of the
// actual template (see TemplateThumbnail) using SAMPLE_RESUME — so what users
// preview here is exactly what they get, and the list can't drift from the
// templates ResumePreview actually supports.
export const TEMPLATES = [
  { id: 'modern',     name: 'Modern',     description: 'Clean, professional layout with accent colors' },
  { id: 'classic',    name: 'Classic',    description: 'Traditional, centered header with refined type' },
  { id: 'minimal',    name: 'Minimal',    description: 'Understated design with clean typography' },
  { id: 'two-column', name: 'Two-Column', description: 'Wide main column with a compact sidebar' },
  { id: 'ats-safe',   name: 'ATS-Safe',   description: 'Plain, machine-readable format for ATS parsing' },
  { id: 'creative',   name: 'Creative',   description: 'Bold colored canvas with card-style sections' },
]

// One shared sample resume so every thumbnail compares layout, not content.
const SAMPLE_RESUME = {
  meta: { template: 'modern', theme: { accentColor: '#2563eb', font: 'sans', density: 'comfortable' } },
  personalInfo: {
    fullName: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '(555) 123-4567',
    address: 'San Francisco, CA',
    links: [
      { id: 'l1', label: 'LinkedIn', url: 'linkedin.com/in/alexjohnson' },
      { id: 'l2', label: 'Portfolio', url: 'alexjohnson.dev' },
    ],
  },
  // Drives the job-title line under the name, so thumbnails show what the real
  // template renders. Two roles on purpose — it exercises the pipe separator.
  professionalInfo: { jobTitle: 'Senior Product Designer, UX Researcher' },
  summary:
    'Senior Product Designer with 6+ years crafting intuitive digital experiences. Proven track record of increasing user engagement and shipping products used by millions.',
  experience: [
    {
      id: 'e1', jobTitle: 'Senior Product Designer', company: 'Acme Corp', location: 'San Francisco, CA',
      startDate: '2021', endDate: '', current: true,
      bullets: [
        { id: 'b1', text: 'Led redesign of the core product, increasing daily active users by 38%.' },
        { id: 'b2', text: 'Built and maintained a design system used across 4 product teams.' },
      ],
    },
    {
      id: 'e2', jobTitle: 'Product Designer', company: 'StartupXYZ', location: 'Remote',
      startDate: '2019', endDate: '2021', current: false,
      bullets: [
        { id: 'b3', text: 'Designed a mobile app adopted by 500K+ users in its first year.' },
      ],
    },
  ],
  education: [
    { id: 'ed1', degree: 'B.F.A. Graphic Design', school: 'Rhode Island School of Design', field: '', graduationDate: '2018' },
  ],
  skills: [
    { id: 's1', name: 'Figma', category: 'Technical', level: 'Expert' },
    { id: 's2', name: 'Prototyping', category: 'Technical', level: 'Advanced' },
    { id: 's3', name: 'User Research', category: 'Technical', level: 'Advanced' },
    { id: 's4', name: 'Design Systems', category: 'Tools', level: 'Expert' },
    { id: 's5', name: 'Communication', category: 'Soft Skills', level: 'Expert' },
  ],
  projects: [
    { id: 'p1', name: 'Design System Overhaul', description: 'Rebuilt the company design system, improving dev velocity by 45%.', link: '', technologies: 'Figma, React' },
  ],
  certifications: [
    { id: 'c1', name: 'Nielsen Norman UX Certification', issuer: 'NN/g', date: '2022' },
  ],
  languages: [
    { id: 'lng1', name: 'English', proficiency: 'Native' },
    { id: 'lng2', name: 'Spanish', proficiency: 'Fluent' },
  ],
  awards: [],
  sectionConfig: [
    { key: 'summary', label: 'Professional Summary', visible: true, order: 0 },
    { key: 'experience', label: 'Experience', visible: true, order: 1 },
    { key: 'education', label: 'Education', visible: true, order: 2 },
    { key: 'skills', label: 'Skills', visible: true, order: 3 },
    { key: 'projects', label: 'Projects', visible: true, order: 4 },
    { key: 'certifications', label: 'Certifications', visible: true, order: 5 },
    { key: 'languages', label: 'Languages', visible: true, order: 6 },
  ],
}

// Renders the real first page of a template, scaled to fit its container at the
// true A4 aspect ratio. Non-interactive — purely a visual preview.
export function TemplateThumbnail({ template, accentColor, pageSize }) {
  // Thumbnails mirror the chosen paper so the aspect ratio previews truthfully.
  const { width: pageW, height: pageH } = getPageSize(pageSize)
  const ref = useRef(null)
  const [scale, setScale] = useState(0.25)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(el.clientWidth / pageW)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pageW])

  const resume = accentColor
    ? { ...SAMPLE_RESUME, meta: { ...SAMPLE_RESUME.meta, theme: { ...SAMPLE_RESUME.meta.theme, accentColor } } }
    : SAMPLE_RESUME

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden bg-white"
      style={{ aspectRatio: `${pageW} / ${pageH}` }}
      aria-hidden="true"
    >
      <div
        style={{
          width: pageW,
          height: pageH,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        <ResumePreview resume={resume} template={template} currentPage={1} />
      </div>
    </div>
  )
}

export function TemplateGallery({ selectedTemplate, onSelect }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            aria-pressed={selectedTemplate === template.id}
            className={`relative group rounded-xl border-2 p-2.5 text-left transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
              selectedTemplate === template.id
                ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="mb-2.5 overflow-hidden rounded-lg ring-1 ring-slate-200/70 shadow-sm">
              <TemplateThumbnail template={template.id} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">{template.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{template.description}</p>
            </div>
            {selectedTemplate === template.id && (
              <div className="absolute top-1.5 right-1.5 bg-indigo-600 text-white rounded-full p-1 shadow-md">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
