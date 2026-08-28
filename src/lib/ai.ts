import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import type { GeneratedQuestion } from "./question-generator";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const googleApiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
const gemini = googleApiKey ? new GoogleGenAI({ apiKey: googleApiKey }) : null;

export function isAiAvailable(): boolean {
  return openai !== null || gemini !== null;
}

export async function generateQuestionsFromChunk(
  chunk: string,
  chunkIndex: number,
  requestedCount: number
): Promise<GeneratedQuestion[]> {
  const perChunk = Math.min(requestedCount, 8);

  const prompt = `당신은 한국 교과서/문제집에서 객관식 기출문제를 출제하는 전문 AI입니다.
아래 텍스트 조각을 읽고, 핵심 개념을 묻는 객관식 문제 ${perChunk}개를 JSON 배열로 만들어주세요.

요구사항:
- 각 문제는 4지선다형입니다.
- 정답은 options 배열 내에서 0부터 시작하는 인덱스로 표시하세요.
- 한국어로 작성하세요.
- 문제 내용(content)에는 질문 문장만 넣고, 보기는 options에 넣으세요.
- 해설(explanation)에는 왜 정답인지 간결히 설명하세요.
- 난이도(difficulty)는 "하", "중", "상" 중 하나입니다.

응답 형식(반드시 JSON 배염만 반환):
[
  {
    "content": "질문",
    "options": ["보기1", "보기2", "보기3", "보기4"],
    "correctAnswer": 0,
    "explanation": "해설",
    "difficulty": "중"
  }
]

텍스트 조각 ${chunkIndex + 1}:
"""
${chunk}
"""
`;

  if (gemini) {
    const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
    const res = await gemini.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "You are a helpful Korean exam-question generator. Always respond with valid JSON arrays only.",
      },
    });
    return parseQuestionJson(res.text ?? "");
  }

  if (openai) {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful Korean exam-question generator. Always respond with valid JSON arrays only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });
    return parseQuestionJson(res.choices[0]?.message?.content?.trim() ?? "");
  }

  return [];
}

function parseQuestionJson(raw: string): GeneratedQuestion[] {
  if (!raw) return [];
  const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as GeneratedQuestion[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((q) => ({
        content: String(q.content ?? ""),
        options: Array.isArray(q.options)
          ? q.options.map((o) => String(o))
          : [],
        correctAnswer: Number(q.correctAnswer ?? 0),
        explanation: String(q.explanation ?? ""),
        difficulty: ["하", "중", "상"].includes(String(q.difficulty))
          ? String(q.difficulty)
          : "중",
      }))
      .filter(
        (q) =>
          q.content &&
          q.options.length >= 2 &&
          q.correctAnswer >= 0 &&
          q.correctAnswer < q.options.length
      );
  } catch {
    return [];
  }
}
