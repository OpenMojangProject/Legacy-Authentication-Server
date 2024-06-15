import { db } from "@/db";
import { session } from "@/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { accessToken } = await request.json();

  await db.delete(session).where(eq(session.jwt, accessToken));

  return Response.json({}, { status: 204 });
}
