import { db } from "@/db";
import { generateUserResponse } from "../helper";

export async function POST(request: Request) {
  const { accessToken } = await request.json();

  const foundSession = await db.query.session.findFirst({
    where: (session, { eq }) => eq(session.jwt, accessToken),
    with: {
      profile: {
        with: {
          user: {
            with: {
              profiles: true,
            },
          },
        },
      },
    },
  });

  if (!foundSession || !foundSession.valid) {
    return Response.json(
      {
        error: "ForbiddenOperationException",
        errorMessage: "Invalid token",
      },
      { status: 403 }
    );
  }

  return generateUserResponse(foundSession.profile.user);
}
