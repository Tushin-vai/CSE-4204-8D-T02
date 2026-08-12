// utils/textExtraction.js
// Extracts plain text from an uploaded report file so the AI can analyze it.
//
// Supported inputs:
//   - PDF (text-based)   -> pdf-parse
//   - PDF (scanned/image)-> rasterize pages with pdfjs-dist + @napi-rs/canvas, then OCR with tesseract.js
//   - Images (jpg/png)   -> OCR with tesseract.js
//
// All language data / fonts / cmaps are resolved from local node_modules so this
// works fully offline (no runtime CDN dependency).

const fs = require('fs');
const os = require('os');
const path = require('path');
const url = require('url');
const { createCanvas } = require('@napi-rs/canvas');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const ApiError = require('./ApiError');

const TESS_LANG_PATH = path.join(__dirname, '..', 'node_modules', '@tesseract.js-data', 'eng', '4.0.0_best_int');
const TESS_CACHE_PATH = path.join(os.tmpdir(), 'medinsight-tesseract-cache');
fs.mkdirSync(TESS_CACHE_PATH, { recursive: true });
const PDFJS_STANDARD_FONTS = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'standard_fonts') + path.sep;
const PDFJS_CMAPS = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'cmaps') + path.sep;

const MIN_TEXT_LENGTH_BEFORE_OCR_FALLBACK = 40; // if pdf-parse extracts less than this, assume it's a scanned PDF
const MAX_OCR_PAGES = 5; // cap OCR pages on scanned PDFs to keep upload times reasonable

// ── OCR a single image buffer ───────────────────────────────────────────────
async function ocrImageBuffer(buffer) {
  const { data } = await Tesseract.recognize(buffer, 'eng', {
    langPath: TESS_LANG_PATH,
    gzip: true,
    cachePath: TESS_CACHE_PATH,
  });
  return (data.text || '').trim();
}

// ── Render a PDF's pages to PNG buffers (for scanned PDFs) ──────────────────
async function renderPdfPagesToImages(buffer, maxPages = MAX_OCR_PAGES) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(buffer);

  const loadingTask = pdfjs.getDocument({
    data,
    disableFontFace: true,
    standardFontDataUrl: url.pathToFileURL(PDFJS_STANDARD_FONTS).href + '/',
    cMapUrl: url.pathToFileURL(PDFJS_CMAPS).href + '/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const pageCount = Math.min(pdfDoc.numPages, maxPages);
  const images = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    images.push(canvas.toBuffer('image/png'));
  }

  return { images, totalPages: pdfDoc.numPages, pagesRendered: pageCount };
}

// ── Extract text from a PDF buffer, falling back to OCR if it's scanned ─────
async function extractTextFromPDF(buffer) {
 const result = await pdfParse(buffer);
  const directText = (result.text || '').trim();

  if (directText.length >= MIN_TEXT_LENGTH_BEFORE_OCR_FALLBACK) {
    return { text: directText, method: 'pdf-text', ocrPagesUsed: 0, totalPages: undefined };
  }

  // Likely a scanned PDF — rasterize pages and OCR them
  const { images, totalPages, pagesRendered } = await renderPdfPagesToImages(buffer);
  if (images.length === 0) {
    throw new ApiError(422, 'Could not extract any content from this PDF.');
  }

  const ocrResults = [];
  for (const imgBuffer of images) {
    const text = await ocrImageBuffer(imgBuffer);
    if (text) ocrResults.push(text);
  }

  const combined = ocrResults.join('\n\n').trim();
  if (!combined) {
    throw new ApiError(422, 'This PDF appears to be a scanned document with no readable text. Try uploading a clearer scan.');
  }

  return {
    text: combined,
    method: 'pdf-ocr',
    ocrPagesUsed: pagesRendered,
    totalPages,
    truncated: totalPages > pagesRendered,
  };
}

// ── Extract text from an image buffer via OCR ────────────────────────────────
async function extractTextFromImage(buffer) {
  const text = await ocrImageBuffer(buffer);
  if (!text) {
    throw new ApiError(422, 'Could not read any text from this image. Try a clearer photo or scan.');
  }
  return { text, method: 'image-ocr', ocrPagesUsed: 1 };
}

// ── Main dispatcher ───────────────────────────────────────────────────────────
const SUPPORTED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
};

async function extractText(buffer, mimetype) {
  const kind = SUPPORTED_MIME_TYPES[mimetype];
  if (!kind) {
    throw new ApiError(415, `Unsupported file type "${mimetype}". Please upload a PDF, JPG, or PNG.`);
  }

  if (kind === 'pdf') return extractTextFromPDF(buffer);
  return extractTextFromImage(buffer);
}

module.exports = {
  extractText,
  extractTextFromPDF,
  extractTextFromImage,
  SUPPORTED_MIME_TYPES,
};
