import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function getUserId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("user_id")?.value;
}

export async function ensureUserId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("user_id")?.value;

  if (existing) {
    const found = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, existing));

    if (found.length > 0) {
      return existing;
    }

    await db.insert(users).values({ id: existing, nickname: "학생" });
    return existing;
  }

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
