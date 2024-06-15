import { db } from "@/db";
import { profile, user } from "@/schema";

export async function POST(request: Request) {
  const { email, username, password, preferredLanguage, registrationCountry } =
    await request.json();

  const key = request.headers.get("Authorization")?.split(" ")[1];

  if (process.env.ADMIN_KEY && key !== process.env.ADMIN_KEY) {
    return Response.json(
      {
        error: "ForbiddenOperationException",
        errorMessage: "Invalid key",
      },
      { status: 403 }
    );
  }

  const newUser = await db
    .insert(user)
    .values({
      email,
      username,
      password: await Bun.password.hash(password),
      preferredLanguage,
      registrationCountry,
    })
    .returning();

  await db.insert(profile).values({
    username: newUser[0]?.username!,
    ownerId: newUser[0]?.id!,
    selected: true,
  });

  return Response.json(
    await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, newUser[0]?.id!),
    })
  );
}
