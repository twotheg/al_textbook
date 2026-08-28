import Link from "next/link";
import { desc, eq, sql, count, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import { books, questions, attempts } from "@/db/schema";
import { getUserId } from "@/lib/auth";
import { UploadBox } from "@/components/UploadBox";
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { deleteBook } from "./actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userId = await getUserId();
  if (!userId) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="text-slate-500">사용자 정보를 불러오는 중이에요...</p>
      </main>
    );
  }

  const userBooks = await db
    .select({
      id: books.id,
      title: books.title,
      filename: books.filename,
      pageCount: books.pageCount,
      status: books.status,
      createdAt: books.createdAt,
    })
    .from(books)
    .where(eq(books.userId, userId))
    .orderBy(desc(books.createdAt));

  const bookIds = userBooks.map((b) => b.id);

  const questionCounts =
    bookIds.length > 0
      ? await db
          .select({ bookId: questions.bookId, total: count(questions.id) })
          .from(questions)
          .where(inArray(questions.bookId, bookIds))
          .groupBy(questions.bookId)
      : [];

  const attemptStats = await db
    .select({
      total: count(attempts.id),
      correct: count(sql`CASE WHEN ${attempts.isCorrect} THEN 1 END`),
      wrong: count(sql`CASE WHEN NOT ${attempts.isCorrect} THEN 1 END`),
    })
    .from(attempts)
    .where(eq(attempts.userId, userId));

  const stats = attemptStats[0] ?? { total: 0, correct: 0, wrong: 0 };
  const correctRate =
    Number(stats.total) > 0
      ? Math.round((Number(stats.correct) / Number(stats.total)) * 100)
      : 0;

  const countMap = new Map(
    questionCounts.map((q) => [q.bookId, Number(q.total)])
  );

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">나만의 문제집</h1>
          <p className="mt-2 text-slate-600">
            PDF 교과서/문제집을 넣으면 300개 이상의 문제를 만들어드려요.
          </p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<BookOpen className="h-5 w-5 text-blue-600" />}
            label="등록한 책"
            value={String(userBooks.length)}
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
            label="정답률"
            value={`${correctRate}%`}
          />
          <StatCard
            icon={<AlertCircle className="h-5 w-5 text-rose-600" />}
            label="틀린 문제"
            value={String(Number(stats.wrong))}
          />
        </section>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">PDF 업로드</h2>
          <UploadBox />
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">내 책 목록</h2>
            <Link
              href="/review"
              className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
              <RotateCcw className="h-4 w-4" />
              오답 복습
            </Link>
          </div>

          {userBooks.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              아직 등록된 PDF가 없어요. 위에서 파일을 올려보세요!
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {userBooks.map((book) => {
                const qCount = countMap.get(book.id) ?? 0;
                return (
                  <li
                    key={book.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {book.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {book.pageCount ? `${book.pageCount}페이지` : ""} ·{" "}
                        {qCount > 0 ? `문제 ${qCount}개` : "문제 미생성"} ·{" "}
                        {book.status === "error" ? (
                          <span className="text-red-600">텍스트 추출 실패</span>
                        ) : (
                          <span className="text-emerald-600">준비 완료</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {qCount > 0 && (
                        <Link
                          href={`/quiz/${book.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4" />
                          풀기
                        </Link>
                      )}
                      <Link
                        href={`/books/${book.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                      >
                        관리
                      </Link>
                      <form action={deleteBook.bind(null, book.id)}>
                        <button
                          type="submit"
                          className="inline-flex items-center rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          aria-label="삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="rounded-xl bg-slate-100 p-3">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
