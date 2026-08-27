import * as pdfjsLib from 'pdfjs-dist';
// Vite resolves this through node_modules and hands back a URL it serves itself,
// so the worker never hits a CDN. pdfjs-dist v6 ships .mjs — the .js paths that
// most guides show are from v3 and resolve to nothing here.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// onProgress({ page, totalPages }) fires after each page so the UI can show real
// progress instead of a spinner that gives no sign the work is advancing.
export async function extractTextFromPDF(file, onProgress) {
  let text;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;

    onProgress?.({ page: 0, totalPages });

    let fullText = '';

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
      onProgress?.({ page: i, totalPages });
    }

    text = fullText.trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`, { cause: error });
  }

  // Checked outside the catch above so this reads as its own plain-language
  // problem rather than being prefixed with "Failed to extract text from PDF".
  // A scanned/photographed resume parses without error but yields no text, and
  // would otherwise reach the model as an empty prompt and come back blank.
  if (text.length < 40) {
    throw new Error(
      'We couldn\'t find any selectable text in this PDF — it looks like a scan or a photo. ' +
      'Export a text-based PDF from your word processor, or build your resume from scratch instead.'
    );
  }

  return text;
}
