import { logger } from "@/lib/logger";
import { getDocumentProxy, extractText } from "unpdf";

export async function parsePdfToText(buffer: Buffer): Promise<string> {
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text.trim();
  } catch (error) {
    logger.error("Error parsing PDF file:", error);
    throw new Error("Failed to parse text from PDF resume");
  }
}
