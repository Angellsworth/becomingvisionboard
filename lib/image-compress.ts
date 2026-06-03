// Client-side image downscale + JPEG compression.
//
// Phone photos are 3-8 MB. Base64-encoding them adds ~33% overhead,
// so a single untouched photo is enough to blow localStorage's
// ~5 MB per-origin quota. This module reduces that by 90%+ while
// keeping images visually identical at board display sizes.

const DEFAULT_MAX_DIM = 1200
const DEFAULT_QUALITY = 0.85

interface CompressOptions {
  maxDim?: number
  /** JPEG quality, 0–1. Defaults to 0.85, a great photo/size trade-off. */
  quality?: number
}

/**
 * Compress a File (or any image data URL via {@link compressDataUrl})
 * down to a manageable JPEG data URL.
 *
 * Returns the original data URL if the image is already small or if
 * compression fails — we'd rather have a slightly oversized image
 * than no image at all.
 */
export function compressImageFile(file: File, opts: CompressOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("file read failed"))
    reader.onload = async (e) => {
      const src = e.target?.result as string
      if (!src) {
        reject(new Error("empty file"))
        return
      }
      try {
        const compressed = await compressDataUrl(src, opts)
        resolve(compressed)
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsDataURL(file)
  })
}

export function compressDataUrl(src: string, opts: CompressOptions = {}): Promise<string> {
  const maxDim = opts.maxDim ?? DEFAULT_MAX_DIM
  const quality = opts.quality ?? DEFAULT_QUALITY

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () => reject(new Error("image decode failed"))
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        // Bail if the image is already small enough — re-encoding would waste cycles
        // and might actually grow PNGs by converting them to less-optimal JPEG.
        if (scale === 1 && src.length < 250_000) {
          resolve(src)
          return
        }
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(src)
          return
        }
        // Fill white so transparent PNGs don't get black backgrounds when JPEGed.
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        const out = canvas.toDataURL("image/jpeg", quality)
        // If compression somehow grew the size (rare), keep the original.
        resolve(out.length < src.length ? out : src)
      } catch {
        // Any unexpected error → keep the original rather than losing data.
        resolve(src)
      }
    }
    img.src = src
  })
}

/** Rough byte size of a data URL (for telemetry / quota checks). */
export function approxByteSize(dataUrl: string): number {
  // Strip "data:...;base64," header for a closer estimate.
  const commaIdx = dataUrl.indexOf(",")
  const payload = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl
  // Base64 → bytes: 3 bytes per 4 chars, ignoring padding.
  return Math.floor((payload.length * 3) / 4)
}
