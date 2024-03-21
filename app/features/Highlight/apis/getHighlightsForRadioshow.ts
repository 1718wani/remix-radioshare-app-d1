

export const getHighlightsForRadioshow = async (
  radioshowId: number,
  userId?: string,
  skip?: number,
  take?: number
) => {
  const highlights = await prisma.highlight.findMany({
    where: { radioshowId },
    include: {
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
    skip: skip,
    take: take,
  });
  return highlights;
};
