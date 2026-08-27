// Profile-photo handling.
//
// Photos are stored inline in the resume as a data URL (the app persists to
// localStorage and has no file backend), so we MUST downscale + re-encode on
// upload — a raw phone photo is several MB and would blow the ~5MB localStorage
// quota. We cap the longest edge and re-encode as JPEG, which keeps a typical
// headshot well under ~60KB. The same data URL renders in the live preview and
// in the Puppeteer PDF with no network round-trip.

export const MAX_PHOTO_DIM = 480
const MAX_INPUT_BYTES = 12 * 1024 * 1024 // reject absurdly large source files early

export function processProfilePhoto(file, { maxDim = MAX_PHOTO_DIM, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected.'))
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file (JPG, PNG, WEBP).'))
    if (file.size > MAX_INPUT_BYTES) return reject(new Error('That image is too large. Please pick one under 12MB.'))

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the image file.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('That image could not be loaded.'))
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        // White matte so transparent PNGs don't turn black under JPEG encoding.
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        try {
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch {
          reject(new Error('Could not process that image.'))
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
