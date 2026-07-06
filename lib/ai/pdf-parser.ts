import { logger } from "@/lib/logger";

export async function parsePdfToText(buffer: Buffer): Promise<string> {
  try {
    // Dynamically require pdf-parse inside function to avoid top-level canvas/DOMMatrix evaluation in SSR/build
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const data = await pdfParse(buffer);
    return data.text.trim();
  } catch (error) {
    logger.error("Error parsing PDF file:", error);
    throw new Error("Failed to parse text from PDF resume");
  }
}
