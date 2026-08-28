import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { books, questions } from "@/db/schema";
import { getUserId } from "@/lib/auth";
import { QuizPlayer } from "@/components/QuizPlayer";

export const dynamic = "force-dynamic";

export default async function QuizPage({
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
    .select({ id: books.id, title: books.title })
    .from(books)
    .where(and(eq(books.id, bookId), eq(books.userId, userId)));

  if (!book) notFound();

  const qs = await db
    .select({
      id: questions.id,
      content: questions.content,
      options: questions.options,
      correctAnswer: questions.correctAnswer,
      explanation: questions.explanation,
      difficulty: questions.difficulty,
    })
    .from(questions)
    .where(eq(questions.bookId, bookId));

  const typedQuestions = qs.map((q) => ({ ...q, options: q.options as string[] }));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <QuizPlayer questions={typedQuestions} bookId={book.id} title={book.title} />
      </div>
    </main>
  );
}
