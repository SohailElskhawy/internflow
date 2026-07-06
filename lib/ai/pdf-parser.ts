import { logger } from "@/lib/logger";

// Polyfill global browser-like classes that pdfjs-dist / pdf-parse checks for at evaluation time in Node environment
if (typeof global !== "undefined") {
  if (!(global as any).DOMMatrix) {
    (global as any).DOMMatrix = class DOMMatrix {};
  }
  if (!(global as any).ImageData) {
    (global as any).ImageData = class ImageData {};
  }
  if (!(global as any).Path2D) {
    (global as any).Path2D = class Path2D {};
  }
}

export async function parsePdfToText(buffer: Buffer): Promise<string> {
  try {
    // Dynamically require pdf-parse inside function to avoid top-level canvas/DOMMatrix evaluation in SSR/build
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require("pdf-parse");
    
    if (typeof PDFParse !== "function") {
      throw new TypeError("PDFParse constructor not found. Check dynamic module exports.");
    }

    const pdfInstance = new PDFParse({ data: buffer });
    const result = await pdfInstance.getText();
    return result.text.trim();
  } catch (error) {
    logger.error("Error parsing PDF file:", error);
    throw new Error("Failed to parse text from PDF resume");
  }
}



