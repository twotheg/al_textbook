import { NextResponse } from "next/server";
import { db } from "@/db";
import { books } from "@/db/schema";
import { ensureUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const title = String(body.title ?? "문제집");
      const text = String(body.text ?? "");
      const pageCount = Number(body.pageCount ?? 0);

      if (text.length < 50) {
        return NextResponse.json(
          { error: "PDF에서 충분한 텍스트를 추출하지 못했습니다." },
          { status: 400 }
        );
      }

      const userId = await ensureUserId();
      const [book] = await db
        .insert(books)
        .values({
          userId,
          title,
          filename: `${title}.pdf`,
          pageCount,
          extractedText: text,
          status: "ready",
        })
        .returning({ id: books.id });

      return NextResponse.json({
        id: book.id,
        title,
        pageCount,
        textLength: text.length,
        status: "ready",
      });
    }

    return NextResponse.json(
      { error: "PDF 파일은 브라우저에서 텍스트를 추출해서 보내야 합니다." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "업로드 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
