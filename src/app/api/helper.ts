import { db } from "@/db";
import { session } from "@/schema";
import { eq } from "drizzle-orm";
import * as jwt from "jsonwebtoken";

export function invalidCredentials() {
  return Response.json(
    {
      error: "ForbiddenOperationException",
      errorMessage: "Invalid credentials. Invalid username or password.",
    },
    { status: 403 }
  );
}

export async function generateUserResponse(user: {
  id: string;
  username: string | null;
  preferredLanguage: string | null;
  registrationCountry: string | null;
  profiles: any[];
}) {
  await db
    .update(session)
    .set({ valid: false })
    .where(eq(session.ownerId, user.id));

  const token = jwt.sign(
    {
      agg: "Adult",
      sub: user?.id!,
      yggt: crypto.randomUUID().replaceAll("-", ""),
      iss: "Yggdrasil-Auth",
    },
    process.env.JWT_SECRET!
  );

  await db.insert(session).values({
    jwt: token!,
    ownerId: user?.id!,
  });

  const selectedProfile = user.profiles.find((profile) => profile.selected!)!;

  return Response.json({
    user: {
      username: user?.username!,
      properties: [
        {
          name: "preferredLanguage",
          value: user?.preferredLanguage!,
        },
        {
          name: "registrationCountry",
          value: user?.registrationCountry!,
        },
      ],
    },
    accessToken: token!,
    availableProfiles: user.profiles.map((profile) => ({
      name: profile?.username!,
      id: profile?.id!,
    })),
    selectedProfile: {
      name: selectedProfile?.username!,
      id: selectedProfile?.id!,
    },
  });
}
