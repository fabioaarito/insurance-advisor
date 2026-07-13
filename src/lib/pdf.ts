import { definePDFJSModule, renderPageAsImage, getDocumentProxy } from "unpdf";

let initialized = false;

async function ensurePDFJS() {
  if (initialized) return;
  const mod = await import("unpdf/pdfjs");
  definePDFJSModule(() => Promise.resolve(mod));
  initialized = true;
}

const MAX_PAGES = 10;

export async function convertPdfToImages(
  pdfBuffer: ArrayBuffer
): Promise<{ dataUrl: string; pageIndex: number }[]> {
  await ensurePDFJS();

  // Clone the buffer first — getDocumentProxy detaches the original
  const bufferClone = pdfBuffer.slice(0);
  const docData = new Uint8Array(bufferClone);
  const doc = await getDocumentProxy(docData);
  const totalPages = Math.min(doc.numPages, MAX_PAGES);
  const images: { dataUrl: string; pageIndex: number }[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const renderData = new Uint8Array(pdfBuffer.slice(0));
    const dataUrl = await renderPageAsImage(renderData, i, {
      canvasImport: () => import("@napi-rs/canvas"),
      scale: 2,
      toDataURL: true,
    });
    images.push({ dataUrl, pageIndex: i - 1 });
  }

  return images;
}
