import { db } from "@/db";
import { session } from "@/schema";
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
  const token = jwt.sign(
    {
      agg: "Adult",
      sub: user?.id!,
      yggt: crypto.randomUUID().replaceAll("-", ""),
      iss: "Yggdrasil-Auth",
    },
    "secret"
  );

  await db.insert(session).values({
    jwt: token!,
    profileId: user?.id!,
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
