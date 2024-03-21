import { authenticator } from "~/features/Auth/services/authenticator";


export const getNewHighlights = async (request: Request, skip: number) => {
    const userId = await authenticator.isAuthenticated(request);
  
    const highlights = await prisma.highlight.findMany({
      include: {
        radioshow: true,
        userHighlights: userId
          ? {
              where: {
                userId: userId,
              },
              select: {
                saved: true,
                liked: true,
                played: true,
              },
            }
          : {},
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: skip,
      take: 30,
    });
    return highlights;
  };