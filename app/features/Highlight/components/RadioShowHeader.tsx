import { AspectRatio, Box, Image, Overlay, Title } from "@mantine/core";

type RadioShowHeaderProps = {
  radioshowImageUrl: string | null;
  radioshowTitle: string;
};

export const RadioShowHeader = ({
  radioshowImageUrl,
  radioshowTitle,
}: RadioShowHeaderProps) => {
  return (
    <>
      <AspectRatio
        ratio={16 / 9}
        h={160}
        w={"full"}
        style={{ position: "relative" }}
      >
        <Image
          src="https://aikunapp.org/%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%BC%E3%83%B3%E3%82%B7%E3%83%A7%E3%83%83%E3%83%88%202024-03-27%2022.09.52.png"
          w={"full"}
          h={160}
          fallbackSrc="https://placehold.co/600x400?text=Placeholder"
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
            style={{ position: "absolute", left: 0, bottom: 0, zIndex: 1000 }}
            p={8}
          >
            {radioshowTitle}
          </Title>
        </Box>
      </AspectRatio>
    </>
  );
};
