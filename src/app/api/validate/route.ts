import { db } from "@/db";

export async function POST(request: Request) {
  const { accessToken } = await request.json();

  const foundSession = await db.query.session.findFirst({
    where: (session, { eq }) => eq(session.jwt, accessToken),
    with: {
      owner: {
        with: {
          profiles: true,
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

  return Response.json({}, { status: 204 });
}
