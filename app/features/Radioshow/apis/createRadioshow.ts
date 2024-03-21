
import { createRadioshowType } from "../types/createRadioshowType";

export const createRadioshow = async (formData: createRadioshowType) => {
  const { title, imageUrl } = formData;
  await prisma.radioshow.create({
    data: {
      title,
      imageUrl,
    },
  });
};
