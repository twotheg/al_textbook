import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and, count } from "drizzle-orm";
import { db } from "@/db";
import { books, questions } from "@/db/schema";
import { getUserId } from "@/lib/auth";
import { GenerateForm } from "@/components/GenerateForm";
import { ArrowLeft, Play } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const userId = await getUserId();
  if (!userId) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="text-slate-500">사용자 정보를 불러오는 중이에요...</p>
      </main>
    );
  }

  const [book] = await db
    .select()
    .from(books)
    .where(and(eq(books.id, bookId), eq(books.userId, userId)));

  if (!book) notFound();

  const [qStat] = await db
    .select({ total: count(questions.id) })
    .from(questions)
    .where(eq(questions.bookId, bookId));

  const qCount = Number(qStat.total);
  const hasText = (book.extractedText?.length ?? 0) > 50;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          대시보드로
        </Link>

        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{book.title}</h1>
          <p className="mt-2 text-slate-600">
            {book.filename} · {book.pageCount ? `${book.pageCount}페이지` : ""} ·{" "}
            {qCount > 0 ? `문제 ${qCount}개 생성됨` : "아직 문제가 없어요"}
          </p>
          {qCount > 0 && (
            <div className="mt-4">
              <Link
                href={`/quiz/${book.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
              >
                <Play className="h-4 w-4" />
                문제 풀기
              </Link>
            </div>
          )}
        </section>

        <GenerateForm bookId={book.id} hasText={hasText} />
      </div>
    </main>
  );
}
