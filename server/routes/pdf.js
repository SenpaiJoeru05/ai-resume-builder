// server/routes/pdf.js
//
// Generates a REAL text-based PDF using Puppeteer's page.pdf().
// This means:
//   ✓ Selectable, copy-pasteable text
//   ✓ ATS scanner readable
//   ✓ Accessible (screen readers work)
//   ✓ Small file size (vector text, not raster images)
//   ✓ Pixel-identical to the live preview (same React component)
//
// How it works:
//   1. Puppeteer opens /print in your running Vite app
//   2. PrintPage.jsx renders ResumePreview for page 1
//   3. We call page.pdf() — Chromium renders real DOM → PDF text layer
//   4. For multi-page resumes, we generate each page separately and
//      merge them with pdf-lib (pure JS, no native deps)

import express    from 'express';
import puppeteer  from 'puppeteer';
import { getResumePageSize } from '../../src/utils/pageSizes.js';

const router = express.Router();

// Page geometry is shared with the client (src/utils/pageSizes.js) rather than
// duplicated here — that duplication is exactly how a PDF ends up a different
// size than the preview it was supposed to match.

const ORIGIN = process.env.APP_ORIGIN || 'http://localhost:5173';

// The client tells us where it's running, because only the browser knows which
// port Vite actually settled on (it silently falls back to :5174 when :5173 is
// taken, which used to make this route load a 404 and time out).
//
// Restricted to loopback: this value drives server-side navigation, so a remote
// caller must not be able to point us at an arbitrary host.
function resolveOrigin(requested) {
  if (!requested) return ORIGIN;
  try {
    const { protocol, hostname } = new URL(requested);
    const isHttp = protocol === 'http:' || protocol === 'https:';
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
    if (isHttp && isLocal) return requested.replace(/\/+$/, '');
  } catch { /* malformed — fall back below */ }
  console.warn('[pdf] ignoring untrusted origin:', requested, '— using', ORIGIN);
  return ORIGIN;
}

// ─── Puppeteer margin = 0 because ResumePreview handles its own padding ───────
const PDF_MARGIN = { top: '0', right: '0', bottom: '0', left: '0' };


router.post('/generate', async (req, res) => {
  let browser;
  try {
    const { resume, template = 'modern', origin } = req.body;
    const appOrigin = resolveOrigin(origin);
    const name = resume?.personalInfo?.fullName || 'Resume';

    // Whatever paper the user picked in Customize — same module the preview
    // reads, so viewport and PDF page size can't disagree with the screen.
    const page = getResumePageSize(resume);

    console.log('[pdf] start — template:', template, '— page:', page.label, page.dimensions, '— origin:', appOrigin);

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--font-render-hinting=none',
      ],
    });

    // ── Step 1: open the print page, find out how many pages ─────────────────
    const probePage = await browser.newPage();
    await probePage.setViewport({ width: page.width, height: page.height });

    // Inject data before page scripts run
    await probePage.evaluateOnNewDocument((r, t) => {
      window.__PRINT_RESUME__   = r;
      window.__PRINT_TEMPLATE__ = t;
    }, resume, template);

    const probeResponse = await probePage.goto(`${appOrigin}/print`, {
      waitUntil: 'networkidle0',
      timeout: 30_000,
    });

    // A 404 here means we're pointed at the wrong port or the app isn't running.
    // Without this check the next step just waits 10s for a global that never
    // arrives and reports an opaque Puppeteer timeout.
    if (!probeResponse || !probeResponse.ok()) {
      throw new Error(
        `The app isn't reachable at ${appOrigin}/print (HTTP ${probeResponse?.status() ?? 'no response'}). ` +
        `Make sure "npm run dev" is running, and that it's serving that port.`
      );
    }

    // Render using SCREEN styles, not print styles. Puppeteer's page.pdf()
    // defaults to print-media emulation, but the app ships a legacy
    // `@media print { * { visibility:hidden } }` rule (App.css) from the old
    // window.print() flow. Forcing screen media makes the PDF an exact match
    // of the live preview the user sees on screen.
    await probePage.emulateMediaType('screen');

    // Wait for ResumePreview to report its page count
    const totalPages = await probePage.waitForFunction(
      () => typeof window.__PRINT_TOTAL_PAGES__ === 'number' && window.__PRINT_TOTAL_PAGES__ >= 1,
      { timeout: 10_000 }
    ).then(() => probePage.evaluate(() => window.__PRINT_TOTAL_PAGES__))
     .catch(() => {
       throw new Error(
         `Loaded ${appOrigin}/print but it never reported a page count — the print ` +
         `page likely hit a render error. Check the browser console on that URL.`
       );
     });

    await probePage.close();

    console.log('[pdf] total pages:', totalPages);

    // ── Step 2: generate one PDF per page, then merge ─────────────────────────
    // Each PDF is exactly one page of the chosen size, with a real text layer.
    const pagePDFs = [];

    for (let p = 1; p <= totalPages; p++) {
      const pg = await browser.newPage();

      await pg.setViewport({ width: page.width, height: page.height });

      // Inject data + the specific page number
      await pg.evaluateOnNewDocument((r, t, pageNum) => {
        window.__PRINT_RESUME__        = r;
        window.__PRINT_TEMPLATE__      = t;
        window.__PRINT_INITIAL_PAGE__  = pageNum;
      }, resume, template, p);

      await pg.goto(`${appOrigin}/print`, {
        waitUntil: 'networkidle0',
        timeout: 30_000,
      });

      // Match the live preview: render with screen styles, not print styles.
      // (See note in the probe step above.)
      await pg.emulateMediaType('screen');

      // Wait for this page's content to be ready
      await pg.waitForFunction(
        (pageNum) => window.__PRINT_CURRENT_PAGE__ === pageNum,
        { timeout: 8_000 },
        p
      );

      // Wait for fonts and layout to settle
      await new Promise(r => setTimeout(r, 200));

      // page.pdf() produces a real text-based PDF
      const pdfBuf = await pg.pdf({
        width:           page.widthMM,
        height:          page.heightMM,
        margin:          PDF_MARGIN,
        printBackground: true,
        // No displayHeaderFooter — footer is rendered inside ResumePreview itself
      });

      pagePDFs.push(pdfBuf);
      await pg.close();

      console.log(`[pdf] rendered page ${p}/${totalPages}`);
    }

    await browser.close();
    browser = null;

    // ── Step 3: merge all single-page PDFs into one document ─────────────────
    const merged = await mergePDFs(pagePDFs, name);

    console.log('[pdf] done — bytes:', merged.length);

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}.pdf"`,
      'Content-Length':      merged.length,
    });
    res.send(merged);

  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error('[pdf] error:', err);
    res.status(500).json({ error: 'Failed to generate PDF', message: err.message });
  }
});

// ─── Merge multiple single-page PDFs into one ─────────────────────────────────
async function mergePDFs(pdfBuffers, authorName) {
  const { PDFDocument } = await import('pdf-lib');

  const merged = await PDFDocument.create();
  merged.setAuthor(authorName);
  merged.setCreator('AI Resume Builder');
  merged.setProducer('Puppeteer + pdf-lib');

  for (const buf of pdfBuffers) {
    const src   = await PDFDocument.load(buf);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach(pg => merged.addPage(pg));
  }

  return Buffer.from(await merged.save());
}

export default router;