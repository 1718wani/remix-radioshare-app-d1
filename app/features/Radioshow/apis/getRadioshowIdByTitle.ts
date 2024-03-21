

export const getRadioshowIdByTitle = async (title: string) => {
  const radioshow = await prisma.radioshow.findFirst({
    where: {
      title: title,
    },
    select: {
      id: true,
    },
  });

  if (!radioshow) {
    throw new Error("Titleがありません",);
  }

  return radioshow.id;
};
