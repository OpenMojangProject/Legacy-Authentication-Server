import { db } from "@/db";
import { invalidCredentials, generateUserResponse } from "../helper";

export async function POST(request: Request) {
  const { username: identifier, password } = await request.json();

  const foundUser = await db.query.user.findFirst({
    where: (user, { eq }) =>
      eq(
        !identifier?.includes("@") &&
          process.env.FEATURE_NON_EMAIL_LOGIN === "true"
          ? user.username
          : user.email,
        identifier
      ),
    with: {
      profiles: true,
    },
  });

  if (!foundUser) {
    return invalidCredentials();
  }

  const passwordMatches = await Bun.password.verify(
    password,
    foundUser?.password!
  );

  if (!passwordMatches) {
    return invalidCredentials();
  }

  return generateUserResponse(foundUser);
}
