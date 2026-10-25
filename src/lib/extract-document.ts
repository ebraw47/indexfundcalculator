"use client";

export type ExtractProgress = {
  stage: "reading" | "ocr" | "pdf" | "done" | "error";
  message: string;
  progress?: number;
};

export async function extractTextFromFile(
  file: File,
  onProgress?: (p: ExtractProgress) => void,
): Promise<string> {
  const type = file.type || "";
  const name = file.name.toLowerCase();

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    onProgress?.({ stage: "pdf", message: "Reading PDF…", progress: 0.1 });
    return extractPdfText(file, onProgress);
  }

  if (
    type.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|bmp)$/i.test(name)
  ) {
    onProgress?.({ stage: "ocr", message: "Running OCR on image…", progress: 0.05 });
    return extractImageText(file, onProgress);
  }

  throw new Error("Unsupported file type. Upload PNG, JPEG, WebP, or PDF.");
}

async function extractImageText(
  file: File,
  onProgress?: (p: ExtractProgress) => void,
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.({
          stage: "ocr",
          message: `OCR ${Math.round(m.progress * 100)}%…`,
          progress: m.progress,
        });
      }
    },
  });
  try {
    const { data } = await worker.recognize(file);
    onProgress?.({ stage: "done", message: "OCR complete", progress: 1 });
    return data.text || "";
  } finally {
    await worker.terminate();
  }
}

async function extractPdfText(
  file: File,
  onProgress?: (p: ExtractProgress) => void,
): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const maxPages = Math.min(doc.numPages, 15);
  const chunks: string[] = [];

  for (let i = 1; i <= maxPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    chunks.push(pageText);
    onProgress?.({
      stage: "pdf",
      message: `PDF page ${i} of ${maxPages}…`,
      progress: i / maxPages,
    });
  }

  let text = chunks.join("\n");

  // Scanned PDF with little/no text → rasterize first pages and OCR
  if (text.replace(/\s+/g, "").length < 40) {
    onProgress?.({
      stage: "ocr",
      message: "PDF looks scanned — running OCR…",
      progress: 0.1,
    });
    const ocrBits: string[] = [];
    const ocrPages = Math.min(doc.numPages, 3);
    for (let i = 1; i <= ocrPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await page.render({
        canvasContext: ctx,
        canvas,
        viewport,
      }).promise;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) continue;
      const imgFile = new File([blob], `page-${i}.png`, { type: "image/png" });
      ocrBits.push(await extractImageText(imgFile, onProgress));
    }
    text = ocrBits.join("\n");
  }

  onProgress?.({ stage: "done", message: "PDF complete", progress: 1 });
  return text;
}
