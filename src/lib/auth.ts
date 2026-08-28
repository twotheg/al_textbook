import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function getUserId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("user_id")?.value;
}

export async function ensureUserId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("user_id")?.value;
  if (existing) return existing;

  const [user] = await db
    .insert(users)
    .values({ nickname: "학생" })
    .returning({ id: users.id });

  cookieStore.set("user_id", user.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
  });

  return user.id;
}
