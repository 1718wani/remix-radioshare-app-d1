

export const getAllRadioshows = async () => {
  const radioshows = await prisma.radioshow.findMany();
  return radioshows;
};
