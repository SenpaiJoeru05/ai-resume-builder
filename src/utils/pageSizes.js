// Single source of truth for page geometry.
//
// This was previously hardcoded as 794×1123 in nine separate places (preview,
// editor scaler, template gallery, PDF modal, preview page, print page and the
// Puppeteer server), which is exactly how those drift apart. Everything now
// reads from here — including server/routes/pdf.js, which imports this file
// directly, so the PDF can't disagree with the preview about paper size.
//
// px values are at 96dpi (CSS reference pixels), which is what Puppeteer assumes
// and what the on-screen preview renders at. mm values are what page.pdf() takes.
//
//   in × 96      = px          e.g. 8.5in  × 96 = 816px
//   in × 25.4    = mm          e.g. 8.5in  × 25.4 = 215.9mm
//   mm ÷ 25.4×96 = px          e.g. 210mm  → 793.7 ≈ 794px

export const PAGE_SIZES = {
  a4: {
    key: 'a4',
    label: 'A4',
    width: 794,
    height: 1123,
    widthMM: '210mm',
    heightMM: '297mm',
    dimensions: '210 × 297 mm',
    note: 'International standard',
  },
  letter: {
    key: 'letter',
    label: 'Letter',
    width: 816,
    height: 1056,
    widthMM: '215.9mm',
    heightMM: '279.4mm',
    dimensions: '8.5 × 11 in',
    note: 'US standard · “short”',
  },
  folio: {
    key: 'folio',
    label: 'Long',
    width: 816,
    height: 1248,
    widthMM: '215.9mm',
    heightMM: '330.2mm',
    dimensions: '8.5 × 13 in',
    note: 'PH long bond paper',
  },
  legal: {
    key: 'legal',
    label: 'Legal',
    width: 816,
    height: 1344,
    widthMM: '215.9mm',
    heightMM: '355.6mm',
    dimensions: '8.5 × 14 in',
    note: 'US legal',
  },
};

export const DEFAULT_PAGE_SIZE = 'a4';

// Always returns a usable size. Resumes created before this existed have no
// pageSize at all, and a stored key could be stale, so both fall back to A4
// rather than rendering a page with undefined dimensions.
export function getPageSize(key) {
  return PAGE_SIZES[key] || PAGE_SIZES[DEFAULT_PAGE_SIZE];
}

// Convenience for the common case of reading it straight off a resume.
export function getResumePageSize(resume) {
  return getPageSize(resume?.meta?.theme?.pageSize);
}

export const PAGE_SIZE_LIST = Object.values(PAGE_SIZES);
