import { useState, useEffect, useRef } from 'react'
import { ResumePreview } from './ResumePreview'
import './PDFPreviewModal.css'

// US Letter at 96 DPI — keep in sync with the .pdf-preview-page size in CSS.
const PAGE_W = 816 // 8.5in
const PAGE_H = 1056 // 11in
const FIT_PADDING = 48 // breathing room around the page when fitting
const ZOOM_STEPS = [0.5, 0.65, 0.8, 1, 1.25, 1.5, 2]

export function PDFPreviewModal({ isOpen, resume, template, onConfirm, onCancel }) {
  // 'fit' auto-scales the page to the viewport; a number is a manual zoom level.
  const [zoom, setZoom] = useState('fit')
  const [fitScale, setFitScale] = useState(1)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState(null)
  const contentRef = useRef(null)

  // Reset transient state whenever the modal is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setZoom('fit')
      setIsDownloading(false)
      setError(null)
    }
  }, [isOpen])

  // Measure the available area and compute the scale that fits the whole page
  // (both width and height) so fit mode never needs scrolling.
  useEffect(() => {
    if (!isOpen) return
    const el = contentRef.current
    if (!el) return

    const compute = () => {
      const availW = el.clientWidth - FIT_PADDING
      const availH = el.clientHeight - FIT_PADDING
      const scale = Math.min(availW / PAGE_W, availH / PAGE_H)
      setFitScale(Math.max(0.1, scale))
    }

    compute()
    const observer = new ResizeObserver(compute)
    observer.observe(el)
    return () => observer.disconnect()
  }, [isOpen])

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape' && !isDownloading) onCancel()
    }
    document.addEventListener('keydown', handleKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, isDownloading, onCancel])

  if (!isOpen) return null

  const isFit = zoom === 'fit'
  const currentScale = isFit ? fitScale : zoom
  const zoomPercent = Math.round(currentScale * 100)

  const zoomOut = () => {
    const next = [...ZOOM_STEPS].reverse().find((s) => s < currentScale - 0.001)
    setZoom(next ?? ZOOM_STEPS[0])
  }

  const zoomIn = () => {
    const next = ZOOM_STEPS.find((s) => s > currentScale + 0.001)
    setZoom(next ?? ZOOM_STEPS[ZOOM_STEPS.length - 1])
  }

  const handleDownload = async () => {
    if (isDownloading) return
    setError(null)
    setIsDownloading(true)
    try {
      await onConfirm()
    } catch (err) {
      setError(err?.message || 'Something went wrong while generating your PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isDownloading) onCancel()
  }

  return (
    <div
      className="pdf-preview-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Resume PDF preview"
    >
      <div className="pdf-preview-modal">
        {/* Header */}
        <div className="pdf-preview-header">
          <div className="pdf-preview-heading">
            <span className="pdf-preview-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <div className="pdf-preview-heading-text">
              <h2 className="pdf-preview-title">Resume Preview</h2>
              <p className="pdf-preview-subtitle">Letter · 8.5" × 11"</p>
            </div>
          </div>

          <button
            className="pdf-preview-close-btn"
            onClick={onCancel}
            disabled={isDownloading}
            aria-label="Close preview"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview canvas */}
        <div className={`pdf-preview-content ${isFit ? 'fit-mode' : 'zoom-mode'}`} ref={contentRef}>
          <div
            className="pdf-preview-page-wrapper"
            style={{ width: PAGE_W * currentScale, height: PAGE_H * currentScale }}
          >
            <div className="pdf-preview-page" style={{ transform: `scale(${currentScale})` }}>
              <ResumePreview resume={resume} template={template} />
            </div>
          </div>
        </div>

        {/* Zoom toolbar */}
        <div className="pdf-preview-toolbar">
          <button
            className="zoom-btn"
            onClick={zoomOut}
            disabled={currentScale <= ZOOM_STEPS[0] + 0.001}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <span className="zoom-level">{zoomPercent}%</span>

          <button
            className="zoom-btn"
            onClick={zoomIn}
            disabled={currentScale >= ZOOM_STEPS[ZOOM_STEPS.length - 1] - 0.001}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <span className="toolbar-divider" aria-hidden="true" />

          <button
            className={`fit-btn ${isFit ? 'active' : ''}`}
            onClick={() => setZoom((z) => (z === 'fit' ? 1 : 'fit'))}
            title={isFit ? 'Actual size (100%)' : 'Fit to screen'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 20v-4m0 4h4m-4-4l5-5m11 5v-4m0 4h-4m4-4l-5-5" />
            </svg>
            <span>Fit</span>
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="pdf-preview-error" role="alert">
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span className="error-message">{error}</span>
            <button
              className="error-dismiss"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Footer actions */}
        <div className="pdf-preview-footer">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={isDownloading}
          >
            Cancel
          </button>
          <button
            className="btn-download"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>Generating…</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
