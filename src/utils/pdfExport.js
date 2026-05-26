export function exportResumePDF(resume) {
  // Use browser's native print which supports modern CSS including oklch colors
  // This is more reliable than html2pdf.js for modern CSS features
  window.print();
}
