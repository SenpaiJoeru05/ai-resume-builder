// src/pages/PrintPage.jsx
//
// Rendered by Puppeteer to produce text-based PDFs.
// Add to your router:  <Route path="/print" element={<PrintPage />} />
//
// Global variables Puppeteer injects via evaluateOnNewDocument:
//   window.__PRINT_RESUME__        — the resume data object
//   window.__PRINT_TEMPLATE__      — template string e.g. 'modern'
//   window.__PRINT_INITIAL_PAGE__  — which page to start on (default 1)
//
// Globals this page exposes back to Puppeteer:
//   window.__PRINT_TOTAL_PAGES__   — set after ResumePreview measures content
//   window.__PRINT_CURRENT_PAGE__  — tracks current rendered page
//   window.__PRINT_SET_PAGE__(n)   — call to switch page (optional)

import { useEffect, useState, useCallback } from 'react'
import { ResumePreview } from '../components/ResumePreview'
import { getResumePageSize } from '../utils/pageSizes'

export default function PrintPage() {
  const initialPage = window.__PRINT_INITIAL_PAGE__ || 1

  const [resume,      setResume]      = useState(null)
  const [template,    setTemplate]    = useState('modern')
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Must match the preview exactly — this is what Puppeteer screenshots.
  const { width: pageW, height: pageH } = getResumePageSize(resume)

  // Bootstrap from injected globals
  useEffect(() => {
    if (window.__PRINT_RESUME__)   setResume(window.__PRINT_RESUME__)
    if (window.__PRINT_TEMPLATE__) setTemplate(window.__PRINT_TEMPLATE__)
    // Expose page-switch function
    window.__PRINT_SET_PAGE__ = (n) => setCurrentPage(n)
  }, [])

  // Keep Puppeteer in sync with current page
  useEffect(() => {
    window.__PRINT_CURRENT_PAGE__ = currentPage
  }, [currentPage])

  const handlePageCount = useCallback((n) => {
    window.__PRINT_TOTAL_PAGES__ = n
  }, [])

  // Minimal shell — NO height, NO overflow, NO border-radius
  // Puppeteer's page.pdf() paginates the natural DOM flow
  if (!resume) {
    return (
      <div style={{ width: pageW, background: 'white', minHeight: pageH }} />
    )
  }

  return (
    <div
      style={{
        width:      pageW,
        margin:     0,
        padding:    0,
        background: 'white',
        // Let content be its natural height — Puppeteer handles pagination
      }}
    >
      <ResumePreview
        resume={resume}
        template={template}
        currentPage={currentPage}
        onPageCountChange={handlePageCount}
      />
    </div>
  )
}