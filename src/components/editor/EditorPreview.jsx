import { ResumePreview } from '../ResumePreview'

export function EditorPreview({ resume, template, onTemplateChange, showTemplateGallery, setShowTemplateGallery, TemplateGallery }) {
  const selectedTemplate = template || 'modern'

  return (
    <div className="hidden xl:flex w-1/2 border-l border-slate-200 bg-slate-100 flex-col overflow-hidden print:block print:flex-none print:w-full print:border-none print:bg-white">
      <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 print:hidden z-10">
        <h2 className="text-lg font-semibold text-slate-900">Live Preview</h2>
      </div>
      <div className="flex-1 overflow-auto flex justify-center items-start py-6">
        <div id="resume-preview" className="bg-white shadow-2xl print:shadow-none print:rounded-none print:p-0 flex-shrink-0 print:w-full relative" style={{ width: '794px', minHeight: '1123px', transform: 'scale(0.9)', transformOrigin: 'top center' }}>
          <ResumePreview resume={resume} template={selectedTemplate} />
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

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">Choose a Template</h2>
              <button
                onClick={() => setShowTemplateGallery(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <TemplateGallery
                selectedTemplate={selectedTemplate}
                onSelect={(template) => {
                  onTemplateChange(template)
                  setShowTemplateGallery(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
