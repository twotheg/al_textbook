"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { books, questions, attempts } from "@/db/schema";
import { ensureUserId } from "@/lib/auth";
import { splitTextIntoChunks } from "@/lib/text";
import { generateQuestionsFromChunk, isAiAvailable } from "@/lib/ai";
import { generateLocalQuestions } from "@/lib/question-generator";
import type { GeneratedQuestion } from "@/lib/question-generator";

export async function saveAttempt(
  questionId: string,
  selectedOption: number
): Promise<{ isCorrect: boolean; correctAnswer: number }> {
  const userId = await ensureUserId();

  const [question] = await db
    .select({ correctAnswer: questions.correctAnswer })
    .from(questions)
    .where(eq(questions.id, questionId));

  if (!question) throw new Error("Question not found");

  const isCorrect = selectedOption === question.correctAnswer;

  await db.insert(attempts).values({
    userId,
    questionId,
    selectedOption,
    isCorrect,
  });

  revalidatePath("/");
  revalidatePath("/review");
  return { isCorrect, correctAnswer: question.correctAnswer };
}

export async function deleteBook(bookId: string) {
  const userId = await ensureUserId();
  await db
    .delete(books)
    .where(and(eq(books.id, bookId), eq(books.userId, userId)));
  revalidatePath("/");
}

export async function generateQuestionsAction(
  bookId: string,
  requestedCount = 300
): Promise<{ count: number; usedAi: boolean }> {
  const userId = await ensureUserId();
  const count = Math.min(Math.max(requestedCount, 10), 500);

  const [book] = await db
    .select({ id: books.id, extractedText: books.extractedText })
    .from(books)
    .where(and(eq(books.id, bookId), eq(books.userId, userId)));

  if (!book) throw new Error("Book not found");
  if (!book.extractedText || book.extractedText.length < 50) {
    throw new Error("PDF에서 충분한 텍스트를 추출하지 못했습니다.");
  }

  const chunks = splitTextIntoChunks(book.extractedText, 3000);
  if (chunks.length === 0) throw new Error("텍스트 조각을 만들 수 없습니다.");

  const generated: GeneratedQuestion[] = [];
  const aiEnabled = isAiAvailable();
  const perChunk = Math.min(10, Math.max(2, Math.ceil(count / chunks.length)));

  if (aiEnabled) {
    const concurrencyLimit = 3;
    for (let i = 0; i < chunks.length; i += concurrencyLimit) {
      const batch = chunks.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map((chunk, idx) =>
          generateQuestionsFromChunk(chunk, i + idx, perChunk)
        )
      );
      for (const result of batchResults) {
        generated.push(...result);
        if (generated.length >= count) break;
      }
      if (generated.length >= count) break;
    }
  }

  const usedAi = aiEnabled && generated.length > 0;
  if (generated.length < count) {
    const remaining = count - generated.length;
    const fallback = generateLocalQuestions(book.extractedText, remaining);
    generated.push(...fallback);
  }

  const unique = generated.slice(0, count);

  if (unique.length === 0) throw new Error("문제를 생성할 수 없습니다.");

  await db.insert(questions).values(
    unique.map((q) => ({
      bookId: book.id,
      content: q.content,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty ?? "중",
    }))
  );

  await db
    .update(books)
    .set({ status: "ready" })
    .where(eq(books.id, bookId));

  revalidatePath("/");
  revalidatePath(`/books/${bookId}`);
  revalidatePath(`/quiz/${bookId}`);
  return { count: unique.length, usedAi };
}
