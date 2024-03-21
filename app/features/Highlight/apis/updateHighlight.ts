import { authenticator } from "~/features/Auth/services/authenticator";

export const updateHighlight = async (
  highlightId: number,
  request: Request,
  played?: boolean,
  saved?: boolean,
  liked?: boolean
) => {
  const userId = await authenticator.isAuthenticated(request);
  if (!userId) {
    return { error: "User not authenticated", authenticated: false };
  }

  const update = await prisma.userHighlight.upsert({
    where: {
      userId_highlightsId: {
        userId: userId,
        highlightsId: highlightId,
      },
    },
    update: {
      played: played,
      saved: saved,
      liked: liked,
    },
    create: {
      userId: userId,
      highlightsId: highlightId,
      played: played ?? false, 
      saved: saved ?? false, 
      liked: liked ?? false, 
    },
  });

  return update;
};
