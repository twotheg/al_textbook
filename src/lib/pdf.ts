import PDFParser from "pdf2json";

export interface ParsedPdf {
  text: string;
  numpages: number;
  info?: Record<string, unknown>;
}

export async function parsePdf(buffer: Buffer): Promise<ParsedPdf> {
  const pdfParser = new PDFParser(null, true);

  return new Promise<ParsedPdf>((resolve, reject) => {
    pdfParser.on("pdfParser_dataError", (err) => {
      reject(err instanceof Error ? err : new Error(String(err)));
    });

    pdfParser.on("pdfParser_dataReady", () => {
      try {
        const text = pdfParser.getRawTextContent() ?? "";
        const data = pdfParser.data as Record<string, unknown> | null;
        const meta = (data?.Meta as Record<string, unknown>) ?? {};
        const pages = data?.Pages as unknown[] | undefined;
        resolve({
          text,
          numpages: pages?.length ?? Number(meta.Pages ?? 0),
          info: meta,
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}
