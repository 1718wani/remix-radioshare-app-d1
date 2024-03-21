import { authenticator } from "~/features/Auth/services/authenticator";

export const getSavedHighlights = async (request: Request, skip: number) => {
  const userId = await authenticator.isAuthenticated(request);
  if (!userId) {
    return [];
  }

  const highlights = await prisma.highlight.findMany({
    where: {
      // userHighlightsの中でsavedがtrueのものだけを取得
      userHighlights: {
        some: {
          userId: userId,
          saved: true,
        },
      },
    },
    include: {
      radioshow: true,
      userHighlights: {
        where: {
          userId: userId,
        },
        select: {
          saved: true,
          liked: true,
          played: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: skip,
    take: 30,
  });
  return highlights;
};
