import Link from "next/link";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import { questions, attempts } from "@/db/schema";
import { getUserId } from "@/lib/auth";
import { QuizPlayer } from "@/components/QuizPlayer";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const userId = await getUserId();
  if (!userId) {
    return (
      <main className="grid min-h-screen place-items-center px-6">
        <p className="text-slate-500">사용자 정보를 불러오는 중이에요...</p>
      </main>
    );
  }

  const wrongRows = await db
    .selectDistinct({ questionId: attempts.questionId })
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.isCorrect, false)));

  const ids = wrongRows.map((r) => r.questionId);

  if (ids.length === 0) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            대시보드로
          </Link>
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600">아직 틀린 문제가 없어요. 훌륭해요!</p>
          </div>
        </div>
      </main>
    );
  }

  const qs = await db
    .select({
      id: questions.id,
      content: questions.content,
      options: questions.options,
      correctAnswer: questions.correctAnswer,
      explanation: questions.explanation,
      difficulty: questions.difficulty,
      bookId: questions.bookId,
    })
    .from(questions)
    .where(inArray(questions.id, ids));

  const typedQuestions = qs.map((q) => ({
    ...q,
    options: q.options as string[],
  }));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          대시보드로
        </Link>
        <QuizPlayer
          questions={typedQuestions}
          bookId="review"
          title="틀린 문제 복습"
        />
      </div>
    </main>
  );
}
