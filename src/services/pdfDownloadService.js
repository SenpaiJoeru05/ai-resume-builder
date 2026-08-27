// Single place that talks to the PDF server.
//
// Two problems this solves, both of which bit in practice:
//
// 1. The server used to guess where the app was running via APP_ORIGIN, which
//    defaults to :5173. Vite silently falls back to :5174 when 5173 is taken, so
//    Puppeteer would load a 404, never see __PRINT_TOTAL_PAGES__, and fail after
//    a 10s timeout with an opaque Puppeteer stack. The browser already knows its
//    own origin — so it sends it, and the server stops guessing.
//
// 2. The endpoint was hardcoded to localhost:3001 in two components, so a
//    deployed build would ask the *visitor's* machine for a PDF. It now comes
//    from VITE_PDF_SERVER_URL, still defaulting to localhost for local dev.

const PDF_SERVER =
  import.meta.env.VITE_PDF_SERVER_URL || 'http://localhost:3001';

export async function generateResumePDF({ resume, template }) {
  let response;
  try {
    response = await fetch(`${PDF_SERVER}/api/pdf/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume,
        template,
        // Where the server should point Puppeteer. Sent because only the browser
        // knows which port Vite actually settled on.
        origin: window.location.origin,
      }),
    });
  } catch {
    // fetch itself rejecting means the server isn't reachable at all.
    throw new Error(
      `Could not reach the PDF server at ${PDF_SERVER}. Start it with "npm run server" and try again.`
    );
  }

  if (!response.ok) {
    // The server sends a JSON message explaining what went wrong; surface it
    // rather than a generic failure.
    let detail = '';
    try {
      detail = (await response.json())?.message || '';
    } catch { /* non-JSON body — fall through to the generic message */ }
    throw new Error(detail || `The PDF server returned an error (${response.status}).`);
  }

  return response.blob();
}

// Triggers the browser download for a generated blob.
export function saveBlobAsFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
