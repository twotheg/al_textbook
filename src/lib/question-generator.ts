import { getRandomItems, shuffleArray } from "./text";

export interface GeneratedQuestion {
  content: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  sourcePage?: number;
  difficulty?: string;
}

export function generateLocalQuestions(
  text: string,
  count: number
): GeneratedQuestion[] {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?。?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12);

  const allWords = Array.from(
    new Set((text.match(/[가-힣]{2,}/g) ?? []))
  ).filter((w) => w.length >= 2);

  const questions: GeneratedQuestion[] = [];
  const difficulties = ["하", "중", "상"];

  for (let i = 0; i < count; i++) {
    const sentence = sentences[i % sentences.length];
    if (!sentence) continue;

    const candidates = allWords.filter((w) => sentence.includes(w));
    const keyword =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : allWords[i % allWords.length];

    if (!keyword) {
      questions.push({
        content: `다음 내용을 읽고 올바른 설명을 고르세요.\n\n"${sentence}"`,
        options: ["맞다", "틀리다", "알 수 없다", "문맥에 없다"],
        correctAnswer: 0,
        explanation: "해당 문장의 내용을 확인하세요.",
        difficulty: difficulties[i % difficulties.length],
      });
      continue;
    }

    const distractors = getRandomItems(
      allWords.filter((w) => w !== keyword),
      3
    );
    const options = shuffleArray([keyword, ...distractors]);
    const content = sentence.replace(keyword, "________");

    questions.push({
      content: `빈칸에 들어갈 말을 고르세요.\n\n"${content}"`,
      options,
      correctAnswer: options.indexOf(keyword),
      explanation: `정답은 "${keyword}"입니다. 문장 전체: "${sentence}"`,
      difficulty: difficulties[i % difficulties.length],
    });
  }

  return questions;
}
