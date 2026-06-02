import { useState } from 'react'

export function PDFUpload({ onFileUploaded, processing }) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }
    onFileUploaded(file)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Upload Your Resume</h2>
        <p className="text-slate-600">Upload an existing resume PDF to extract your information</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-16 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 hover:border-slate-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <svg className="w-20 h-20 text-slate-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-lg text-slate-600 mb-2">
          {processing ? 'Processing PDF...' : 'Drag and drop your resume PDF here'}
        </p>
        <p className="text-slate-400 text-sm mb-6">or</p>
        <label className="inline-block">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            className="hidden"
            disabled={processing}
          />
          <span className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer font-medium transition">
            Browse Files
          </span>
        </label>
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800">Note</p>
            <p className="text-sm text-yellow-700">
              PDF import uses AI to extract information. Results may vary based on PDF format and quality. Please review and edit imported data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
