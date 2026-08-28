import { PDFParse } from "pdf-parse";

PDFParse.setWorker(
  "https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf.worker.mjs"
);

export interface ParsedPdf {
  text: string;
  numpages: number;
}

export async function extractTextFromFile(file: File): Promise<ParsedPdf> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  const parser = new PDFParse({ data });
  const textResult = await parser.getText();
  const infoResult = await parser.getInfo();
  await parser.destroy();

  return {
    text: textResult.text ?? "",
    numpages: textResult.total ?? Number(infoResult.info?.Pages ?? 0),
  };
}
