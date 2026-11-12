import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from './db';
import { ReferenceBook, ReferenceBookChunk, BookSearchResult } from '../src/types';

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
const BOOKS_DIR = path.join(DATA_DIR, 'books');

// Ensure directory exists
try {
  if (!fs.existsSync(BOOKS_DIR)) {
    fs.mkdirSync(BOOKS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('[ReferenceBookService] Could not create books dir:', e);
}

export const SERWAY_BOOK_ID = 'book-serway-physics';

// Core topics list as specified in requirements
export const SERWAY_PHYSICS_TOPICS = [
  { id: 'units', titleEn: 'Physical Quantities and Units', titleAr: 'الكميات الفيزيائية ووحدات القياس الدولية', chapter: 'Chapter 1: Physics and Measurement' },
  { id: 'vectors', titleEn: 'Vectors', titleAr: 'المتجهات وتحليل القوى', chapter: 'Chapter 3: Vectors' },
  { id: 'motion1d', titleEn: 'Motion in One Dimension', titleAr: 'الحركة في بعد واحد', chapter: 'Chapter 2: Motion in One Dimension' },
  { id: 'newton', titleEn: "Newton's Laws of Motion", titleAr: 'قوانين نيوتن في الحركة والقوى', chapter: 'Chapter 5: The Laws of Motion' },
  { id: 'work_energy', titleEn: 'Work and Energy', titleAr: 'الشغل والطاقة الميكانيكية', chapter: 'Chapter 7: Energy of a System' },
  { id: 'momentum', titleEn: 'Momentum and Collisions', titleAr: 'كمية التحرك والتصادمات', chapter: 'Chapter 9: Linear Momentum and Collisions' },
  { id: 'rotation', titleEn: 'Rotational Motion', titleAr: 'الحركة الدورانية وعزم القصور الذاتي', chapter: 'Chapter 10: Rotation of a Rigid Object' },
  { id: 'oscillations', titleEn: 'Oscillations', titleAr: 'الاهتزازات والحركة التوافقية البسيطة', chapter: 'Chapter 15: Oscillatory Motion' },
  { id: 'waves', titleEn: 'Waves', titleAr: 'حركة الموجات والصوت', chapter: 'Chapter 16: Wave Motion' },
  { id: 'electric_fields', titleEn: 'Electric Fields', titleAr: 'المجالات الكهربائية وقانون كولوم', chapter: 'Chapter 23: Electric Fields' },
  { id: 'electric_potential', titleEn: 'Electric Potential', titleAr: 'الجهد الكهربائي وطاقة الوضع الكهربائية', chapter: 'Chapter 25: Electric Potential' },
  { id: 'capacitance', titleEn: 'Capacitance', titleAr: 'المكثفات والسعة الكهربائية والعوازل', chapter: 'Chapter 26: Capacitance and Dielectrics' },
  { id: 'current_resistance', titleEn: 'Current and Resistance', titleAr: 'التيار الكهربائي والمقاومة وقانون أوم', chapter: 'Chapter 27: Current and Resistance' },
  { id: 'dc_circuits', titleEn: 'Direct-Current Circuits', titleAr: 'دوائر التيار المستمر وقواعد كيرشوف', chapter: 'Chapter 28: Direct-Current Circuits' },
  { id: 'magnetic_fields', titleEn: 'Magnetic Fields', titleAr: 'المجالات والقوى المغناطيسية', chapter: 'Chapter 29: Magnetic Fields' },
  { id: 'induction', titleEn: 'Electromagnetic Induction', titleAr: 'الحث الكهرومغناطيسي وقانون فاراداي ولينز', chapter: 'Chapter 31: Faraday\'s Law' },
  { id: 'ac_circuits', titleEn: 'Alternating-Current Circuits', titleAr: 'دوائر التيار المتردد والممانعة الكهربائية', chapter: 'Chapter 33: Alternating-Current Circuits' },
];

// Default Serway reference card - explicitly labeled NOT uploaded until admin uploads verified PDF
export const DEFAULT_SERWAY_BOOK: ReferenceBook = {
  id: SERWAY_BOOK_ID,
  title: 'Physics for Scientists and Engineers',
  originalTitle: 'Physics for Scientists and Engineers — Serway',
  authors: ['Raymond A. Serway', 'John W. Jewett'],
  edition: 'الطبعة المعتمدة (تحدد بدقة عند رفع النسخة)',
  publicationYear: undefined,
  language: 'الإنجليزية (English)',
  field: 'الفيزياء العامة والهندسية (General and Engineering Physics)',
  targetMajor: 'هندسة الميكاترونكس (Mechatronics Engineering)',
  description: 'المرجع الأكاديمي العالمي المعتمد في الجامعات اليمنية وكليات الهندسة لتدريس مساقات الفيزياء العامة 1 و 2 (الميكانيكا، الكهرومغناطيسية، والدوائر الكهربائية). يوفر تأسيسًا متينًا لمهندسي الميكاترونكس.',
  hasFile: false,
  processingStatus: 'not_uploaded',
  chunksCount: 0,
  createdAt: '2026-10-25T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  officialExternalUrl: 'https://www.cengage.com/c/physics-for-scientists-and-engineers-10e-serway/9781337553292/',
  topicsCovered: SERWAY_PHYSICS_TOPICS.map(t => t.titleEn),
  accessRole: 'student',
};

// In-Memory cache of books and chunks to support serverless fast response
let cachedBooks: ReferenceBook[] | null = null;
const cachedChunks: Record<string, ReferenceBookChunk[]> = {};

/**
 * Get chunks file path for a book
 */
function getChunksFilePath(bookId: string): string {
  const safeId = bookId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(BOOKS_DIR, `${safeId}_chunks.json`);
}

/**
 * Get book metadata file path
 */
function getBooksMetaFilePath(): string {
  return path.join(BOOKS_DIR, 'books_meta.json');
}

/**
 * Load all books
 */
export function getAllReferenceBooks(): ReferenceBook[] {
  if (cachedBooks) return cachedBooks;

  const metaPath = getBooksMetaFilePath();
  let books: ReferenceBook[] = [];

  if (fs.existsSync(metaPath)) {
    try {
      const raw = fs.readFileSync(metaPath, 'utf-8');
      books = JSON.parse(raw);
    } catch (e) {
      console.warn('[ReferenceBookService] Failed to parse books_meta.json:', e);
    }
  }

  // Ensure default Serway book is present
  const hasSerway = books.some(b => b.id === SERWAY_BOOK_ID);
  if (!hasSerway) {
    books.unshift({ ...DEFAULT_SERWAY_BOOK });
    saveAllReferenceBooks(books);
  }

  cachedBooks = books;
  return books;
}

/**
 * Save all books metadata
 */
export function saveAllReferenceBooks(books: ReferenceBook[]): void {
  cachedBooks = books;
  const metaPath = getBooksMetaFilePath();
  try {
    fs.writeFileSync(metaPath, JSON.stringify(books, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[ReferenceBookService] Could not write books_meta.json:', e);
  }
}

/**
 * Get single reference book
 */
export function getReferenceBookById(bookId: string): ReferenceBook | null {
  const books = getAllReferenceBooks();
  return books.find(b => b.id === bookId) || null;
}

/**
 * Update a reference book's status or metadata
 */
export function updateReferenceBook(bookId: string, updates: Partial<ReferenceBook>): ReferenceBook | null {
  const books = getAllReferenceBooks();
  const index = books.findIndex(b => b.id === bookId);
  if (index === -1) return null;

  books[index] = {
    ...books[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveAllReferenceBooks(books);
  return books[index];
}

/**
 * Delete a reference book and its indexed chunks
 */
export function deleteReferenceBook(bookId: string): boolean {
  if (bookId === SERWAY_BOOK_ID) {
    // For Serway, reset to not_uploaded instead of completely removing
    updateReferenceBook(bookId, {
      hasFile: false,
      processingStatus: 'not_uploaded',
      chunksCount: 0,
      fileName: undefined,
      fileSize: undefined,
      totalPages: undefined,
      fileReference: undefined,
      processingError: undefined,
      indexedAt: undefined,
    });
    delete cachedChunks[bookId];
    const chunksPath = getChunksFilePath(bookId);
    if (fs.existsSync(chunksPath)) {
      try { fs.unlinkSync(chunksPath); } catch (_) {}
    }
    return true;
  }

  let books = getAllReferenceBooks();
  books = books.filter(b => b.id !== bookId);
  saveAllReferenceBooks(books);
  delete cachedChunks[bookId];

  const chunksPath = getChunksFilePath(bookId);
  if (fs.existsSync(chunksPath)) {
    try { fs.unlinkSync(chunksPath); } catch (_) {}
  }
  return true;
}

/**
 * Load chunks for a book
 */
export function getBookChunks(bookId: string): ReferenceBookChunk[] {
  if (cachedChunks[bookId]) {
    return cachedChunks[bookId];
  }

  const chunksPath = getChunksFilePath(bookId);
  if (fs.existsSync(chunksPath)) {
    try {
      const raw = fs.readFileSync(chunksPath, 'utf-8');
      const chunks: ReferenceBookChunk[] = JSON.parse(raw);
      cachedChunks[bookId] = chunks;
      return chunks;
    } catch (e) {
      console.warn(`[ReferenceBookService] Failed to load chunks for ${bookId}:`, e);
    }
  }

  return [];
}

/**
 * Save chunks for a book
 */
export function saveBookChunks(bookId: string, chunks: ReferenceBookChunk[]): void {
  cachedChunks[bookId] = chunks;
  const chunksPath = getChunksFilePath(bookId);
  try {
    fs.writeFileSync(chunksPath, JSON.stringify(chunks, null, 2), 'utf-8');
  } catch (e) {
    console.warn(`[ReferenceBookService] Failed to write chunks for ${bookId}:`, e);
  }
}

/**
 * Intelligent text chunking from extracted PDF text
 */
export function chunkExtractedPdfText(
  bookId: string,
  pagesText: Array<{ pageNumber: number; text: string }>,
  maxChunkChars: number = 900
): ReferenceBookChunk[] {
  const chunks: ReferenceBookChunk[] = [];
  let currentChapter = 'General Physics';

  for (const page of pagesText) {
    const rawText = page.text || '';
    if (!rawText.trim()) continue;

    // Detect chapter heading in page text
    const chapterMatch = rawText.match(/(?:Chapter|CHAPTER|الفصل)\s*(\d+)[:\.\s-]*([^\n\r]+)/i);
    if (chapterMatch) {
      currentChapter = `Chapter ${chapterMatch[1]}: ${chapterMatch[2].trim()}`;
    }

    // Split text into paragraphs
    const paragraphs = rawText
      .split(/\n\s*\n/)
      .map(p => p.replace(/\s+/g, ' ').trim())
      .filter(p => p.length > 25);

    let currentChunkText = '';
    let currentSection = '';

    for (const paragraph of paragraphs) {
      // Check for section title (e.g. 1.2 Standards of Length, Mass, and Time)
      const sectionMatch = paragraph.match(/^(\d+\.\d+)\s+([A-Za-z\s]+)/);
      if (sectionMatch) {
        currentSection = `${sectionMatch[1]} ${sectionMatch[2]}`;
      }

      if ((currentChunkText + ' ' + paragraph).length > maxChunkChars && currentChunkText.length > 100) {
        // Push chunk
        chunks.push(createChunkObject(bookId, currentChapter, page.pageNumber, currentSection, currentChunkText));
        currentChunkText = paragraph;
      } else {
        currentChunkText = currentChunkText ? `${currentChunkText}\n\n${paragraph}` : paragraph;
      }
    }

    if (currentChunkText.trim().length > 50) {
      chunks.push(createChunkObject(bookId, currentChapter, page.pageNumber, currentSection, currentChunkText));
    }
  }

  return chunks;
}

function createChunkObject(
  bookId: string,
  chapterTitle: string,
  pageNumber: number,
  sectionTitle: string,
  content: string
): ReferenceBookChunk {
  // Extract keywords
  const words = content
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);

  const keywords = Array.from(new Set(words)).slice(0, 15);

  return {
    id: `chunk_${bookId}_p${pageNumber}_${crypto.randomBytes(3).toString('hex')}`,
    bookId,
    chapterTitle: chapterTitle || 'Physics Reference',
    pageNumber,
    sectionTitle: sectionTitle || undefined,
    content: content.trim(),
    keywords,
  };
}

/**
 * Extract PDF pages text using pdf-parse with safe error handling
 */
export async function parsePdfBufferToPages(buffer: Buffer): Promise<Array<{ pageNumber: number; text: string }>> {
  const pages: Array<{ pageNumber: number; text: string }> = [];

  try {
    const { createRequire } = await import('module');
    const req = createRequire(import.meta.url);
    const pdfPkg = req('pdf-parse');

    if (pdfPkg?.PDFParse) {
      const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      const parser = new pdfPkg.PDFParse(uint8);
      const parsed = await parser.getText();

      if (Array.isArray(parsed?.pages) && parsed.pages.length > 0) {
        parsed.pages.forEach((p: any, idx: number) => {
          pages.push({
            pageNumber: p.num || idx + 1,
            text: p.text || '',
          });
        });
        return pages;
      }
      if (typeof parsed?.text === 'string' && parsed.text.trim()) {
        pages.push({ pageNumber: 1, text: parsed.text });
        return pages;
      }
    } else if (typeof pdfPkg === 'function') {
      const parsed = await pdfPkg(buffer);
      if (parsed?.text) {
        // Estimate pages from form feed or length
        const rawPages = parsed.text.split(/\f/);
        rawPages.forEach((txt: string, idx: number) => {
          if (txt.trim()) {
            pages.push({ pageNumber: idx + 1, text: txt.trim() });
          }
        });
        if (pages.length === 0) {
          pages.push({ pageNumber: 1, text: parsed.text });
        }
        return pages;
      }
    }
  } catch (err: any) {
    console.error('[ReferenceBookService] PDF extraction failed:', err?.message || err);
    throw new Error(`تعذر استخراج النص من ملف PDF: ${err?.message || 'تنسيق غير مدعوم'}`);
  }

  return pages;
}

/**
 * Process uploaded PDF file for a reference book
 */
export async function processBookUpload(
  bookId: string,
  fileBuffer: Buffer,
  fileName: string,
  fileSize: number
): Promise<{ success: boolean; chunksCount: number; message: string }> {
  // 1. Validation
  if (!fileName.toLowerCase().endsWith('.pdf')) {
    throw new Error('نوع الملف غير صالح. يُسمح فقط بملفات PDF الأكاديمية.');
  }

  // Maximum size 50MB for serverless environment protection
  const maxBytes = 50 * 1024 * 1024;
  if (fileSize > maxBytes) {
    throw new Error(`حجم الملف كبير جداً (${Math.round(fileSize / (1024 * 1024))}MB). الحد الأقصى للمعالجة هو 50MB لتجنب توقف المعالجة على Vercel.`);
  }

  // Update status to processing
  updateReferenceBook(bookId, {
    processingStatus: 'processing',
    processingProgress: 15,
    fileName,
    fileSize,
    processingError: undefined,
  });

  try {
    // 2. Extract text from PDF
    const pages = await parsePdfBufferToPages(fileBuffer);
    if (!pages || pages.length === 0) {
      throw new Error('لم يتم العثور على صفحات نصية قابلة للقراءة داخل ملف PDF. قد يكون الملف ممسوحًا ضوئيًا كصور أو محميًا بكلمة سر.');
    }

    updateReferenceBook(bookId, {
      processingProgress: 60,
      totalPages: pages.length,
    });

    // 3. Chunk content
    const chunks = chunkExtractedPdfText(bookId, pages, 900);
    if (chunks.length === 0) {
      throw new Error('النص المستخرج فارغ أو غير كافٍ لإنشاء فهرس بحث دلالي.');
    }

    // 4. Save chunks
    saveBookChunks(bookId, chunks);

    // 5. Update book status to ready
    updateReferenceBook(bookId, {
      hasFile: true,
      processingStatus: 'ready',
      processingProgress: 100,
      chunksCount: chunks.length,
      totalPages: pages.length,
      indexedAt: new Date().toISOString(),
      processingError: undefined,
    });

    return {
      success: true,
      chunksCount: chunks.length,
      message: `تمت معالجة وفهرسة الكتاب بنجاح: تم استخراج ${pages.length} صفحة وتقسيمها إلى ${chunks.length} مقطع بحثي قابل للاسترجاع.`,
    };
  } catch (err: any) {
    const errorMsg = err?.message || 'حدث خطأ أثناء معالجة وفهرسة ملف PDF.';
    updateReferenceBook(bookId, {
      processingStatus: 'failed',
      processingProgress: 0,
      processingError: errorMsg,
    });
    throw new Error(errorMsg);
  }
}

/**
 * Normalize and tokenize text for robust multilingual search
 */
function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 2);
}

/**
 * Search inside book chunks using RAG retrieval scoring
 */
export function searchBookChunks(
  bookId: string,
  query: string,
  limit: number = 5
): BookSearchResult {
  const book = getReferenceBookById(bookId);
  const bookTitle = book?.originalTitle || book?.title || 'Physics Reference';

  if (!query || !query.trim()) {
    return {
      query: '',
      bookId,
      bookTitle,
      totalMatches: 0,
      chunks: [],
    };
  }

  const chunks = getBookChunks(bookId);

  // If book has no uploaded chunks, return empty list without fabricating
  if (!chunks || chunks.length === 0) {
    return {
      query,
      bookId,
      bookTitle,
      totalMatches: 0,
      chunks: [],
    };
  }

  const queryTerms = tokenizeQuery(query);
  const scoredChunks: Array<{ chunk: ReferenceBookChunk; score: number; snippet: string }> = [];

  for (const chunk of chunks) {
    const contentLower = chunk.content.toLowerCase();
    const chapterLower = chunk.chapterTitle.toLowerCase();
    const sectionLower = (chunk.sectionTitle || '').toLowerCase();

    let score = 0;
    let firstMatchIndex = -1;

    for (const term of queryTerms) {
      // Exact term in content
      if (contentLower.includes(term)) {
        score += 3;
        if (firstMatchIndex === -1) {
          firstMatchIndex = contentLower.indexOf(term);
        }
      }
      // Exact term in chapter or section
      if (chapterLower.includes(term) || sectionLower.includes(term)) {
        score += 5;
      }
      // Exact term in keywords
      if (chunk.keywords && chunk.keywords.some(k => k.includes(term))) {
        score += 2;
      }
    }

    // Exact phrase match bonus
    const phrase = query.trim().toLowerCase();
    if (contentLower.includes(phrase)) {
      score += 10;
      firstMatchIndex = contentLower.indexOf(phrase);
    }

    if (score > 0) {
      // Build snippet around the match
      let snippet = '';
      if (firstMatchIndex !== -1) {
        const start = Math.max(0, firstMatchIndex - 60);
        const end = Math.min(chunk.content.length, firstMatchIndex + 160);
        snippet = (start > 0 ? '...' : '') + chunk.content.substring(start, end).replace(/\s+/g, ' ') + (end < chunk.content.length ? '...' : '');
      } else {
        snippet = chunk.content.substring(0, 180).replace(/\s+/g, ' ') + '...';
      }

      scoredChunks.push({
        chunk: {
          ...chunk,
          snippet,
          score,
        },
        score,
        snippet,
      });
    }
  }

  // Sort descending by relevance score
  scoredChunks.sort((a, b) => b.score - a.score);

  const topChunks = scoredChunks.slice(0, limit).map(item => item.chunk);

  return {
    query,
    bookId,
    bookTitle,
    totalMatches: scoredChunks.length,
    chunks: topChunks,
  };
}

/**
 * Retrieve curated topic overview when book file is not yet uploaded
 * (Explains topic truthfully without falsely claiming verified page citations)
 */
export function getPhysicsTopicInfo(topicTitleOrId: string) {
  const norm = topicTitleOrId.toLowerCase().trim();
  return SERWAY_PHYSICS_TOPICS.find(
    t => t.id === norm || t.titleEn.toLowerCase().includes(norm) || norm.includes(t.titleEn.toLowerCase()) || t.titleAr.includes(norm)
  );
}
