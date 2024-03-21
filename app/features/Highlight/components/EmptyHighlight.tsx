import { Center, Image, Title } from "@mantine/core";

export const EmptyHighlight = () => {
  return (
    <>
      <Center mt={"xl"}>
        <Title order={2}>まだ登録されていません</Title>
      </Center>
      <Image
        width="40"
        height="auto"
        fit="cover"
        src="/bansyakunekochan.png"
        alt="success"
      />
    </>
  );
};
