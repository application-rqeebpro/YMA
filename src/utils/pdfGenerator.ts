import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  fileName?: string;
  onProgress?: (step: string) => void;
}

/**
 * High-fidelity PDF generator for Engineering Assignments.
 * Renders print-formatted DOM elements directly into a multipage A4 PDF document,
 * preserving Arabic calligraphy, text direction (RTL/LTR), tables, formulas, and diagrams.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const fileName = options.fileName || 'تكليف_ميكاترونكس.pdf';

  try {
    options.onProgress?.('جاري تهيئة صفحات المستند للطباعة...');

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidthMm = 210;
    const pdfHeightMm = 297;

    // Find all distinct page wrappers inside the target element
    const pageNodes = Array.from(
      element.querySelectorAll<HTMLElement>('[data-pdf-page="true"]')
    );

    if (pageNodes.length === 0) {
      // Single continuous capture fallback
      options.onProgress?.('جاري التقاط صفحات التكليف...');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidthMm) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidthMm, pdfHeight, undefined, 'FAST');
      heightLeft -= pdfHeightMm;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidthMm, pdfHeight, undefined, 'FAST');
        heightLeft -= pdfHeightMm;
      }
    } else {
      // Individual dedicated page capture for pristine pagination
      for (let i = 0; i < pageNodes.length; i++) {
        options.onProgress?.(`جاري تجهيز الصفحة ${i + 1} من ${pageNodes.length}...`);
        const pageEl = pageNodes[i];

        const canvas = await html2canvas(pageEl, {
          scale: 2.2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794, // Standard A4 width at 96 DPI
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.96);

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
      }
    }

    options.onProgress?.('تم إنشاء ملف PDF بنجاح! جاري التنزيل...');
    pdf.save(fileName);
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    throw new Error(error?.message || 'حدث خطأ أثناء إنشاء ملف PDF');
  }
}

export interface GenerateImageOptions {
  fileName?: string;
  onProgress?: (step: string) => void;
  scale?: number;
}

/**
 * High-resolution image exporter for Exam Papers & Engineering Documents.
 * Renders the element directly to PNG, ideal for sharing via WhatsApp/Telegram or gallery saving.
 */
export async function exportElementToImage(
  element: HTMLElement,
  options: GenerateImageOptions = {}
): Promise<void> {
  const fileName = options.fileName || 'نموذج_اختبار_ميكاترونكس.png';

  try {
    options.onProgress?.('جاري تحويل نموذج الاختبار إلى صورة عالية الدقة...');

    const canvas = await html2canvas(element, {
      scale: options.scale || 2.2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    options.onProgress?.('جاري تنزيل الصورة...');
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const downloadLink = document.createElement('a');
    downloadLink.download = fileName;
    downloadLink.href = dataUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    options.onProgress?.('تم تنزيل صورة نموذج الاختبار بنجاح!');
  } catch (error: any) {
    console.error('Image Export Error:', error);
    throw new Error(error?.message || 'تعذر تصدير نموذج الاختبار كصورة');
  }
}
