import { NextResponse } from "next/server";
import { db } from "@/db";
import { books } from "@/db/schema";
import { parsePdf } from "@/lib/pdf";
import { ensureUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;
    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "PDF 파일을 업로드해주세요." },
        { status: 400 }
      );
    }

    const userId = await ensureUserId();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const parsed = await parsePdf(buffer);

    const [book] = await db
      .insert(books)
      .values({
        userId,
        title: file.name.replace(/\.pdf$/i, ""),
        filename: file.name,
        pageCount: parsed.numpages,
        extractedText: parsed.text,
        status: parsed.text.length > 50 ? "ready" : "error",
      })
      .returning({ id: books.id });

    return NextResponse.json({
      id: book.id,
      title: file.name.replace(/\.pdf$/i, ""),
      pageCount: parsed.numpages,
      textLength: parsed.text.length,
      status: parsed.text.length > 50 ? "ready" : "error",
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "업로드 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
