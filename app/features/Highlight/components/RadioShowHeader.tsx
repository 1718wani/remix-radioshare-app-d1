import { AspectRatio, Box, Image, Overlay, Title } from "@mantine/core";
import { customeDomain } from "~/consts/customeDomain";

type RadioShowHeaderProps = {
  radioshowImageUrl: string | null;
  radioshowTitle: string;
};

export const RadioShowHeader = ({
  radioshowImageUrl,
  radioshowTitle,
}: RadioShowHeaderProps) => {
  const correctImageUrl = `${customeDomain}${radioshowImageUrl}`;
  return (
    <>
      <AspectRatio
        ratio={16 / 9}
        h={160}
        w={"full"}
        style={{ position: "relative" }}
      >
        <Image
          src={correctImageUrl}
          w={"full"}
          h={160}
          fallbackSrc="/radiowaiting.png"
        />
        <Overlay
          gradient="linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 60%)"
          opacity={0.85}
          h={160}
          style={{ position: "absolute", top: 0, left: 0, right: 0 }}
        />
        <Box>
          <Title
            order={3}
            c={"gray.0"}
            style={{ position: "absolute", left: 0, bottom: 0, zIndex: 200 }}
            p={8}
          >
            {radioshowTitle}
          </Title>
        </Box>
      </AspectRatio>
    </>
  );
};
