import {
  Card,
  Text,
  Accordion,
  Group,
  ActionIcon,
  Flex,
  useMantineTheme,
  Button,
  Badge,
} from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import { IconBookmark, IconHeart } from "@tabler/icons-react";
import { parseISO, isWithinInterval, add } from "date-fns";

type props = {
  id: string;
  title: string;
  description: string;
  playUrl: string;
  createdAt: string;
  liked: boolean;
  saved: boolean;
  played: boolean;
};

export const HighLightCard = (props: props) => {
  const fetcher = useFetcher();
  const { id, title, description, playUrl, createdAt, liked, saved, played } =
    props;
  const theme = useMantineTheme();

  // formDataから値を取得する前に、キーが存在するか確認
  const likedState =
    fetcher.formData && fetcher.formData.has("liked")
      ? fetcher.formData.get("liked") === "true"
      : liked;

  const savedState =
    fetcher.formData && fetcher.formData.has("saved")
      ? fetcher.formData.get("saved") === "true"
      : saved;

  const isWithinAWeek = (dateString: string) => {
    const date = parseISO(dateString);
    const now = new Date();
    const oneWeekAgo = add(now, { weeks: -1 }); // 1週間前の日付を計算
    return isWithinInterval(date, { start: oneWeekAgo, end: now });
  };

  return (
    <>
      <Card withBorder padding="md" radius="md" mx={"sm"}>
        {played && (
          <Badge w="fit-content" variant="light">
            再生済み
          </Badge>
        )}

        {isWithinAWeek(createdAt) && !played && (
          <Badge w="fit-content" variant="light">
            NEW !
          </Badge>
        )}

        <Flex justify={"space-between"} mx={"sm"}>
          <Text truncate fz="xl" fw={700} mt="sm">
            {title}
          </Text>
          <Group gap={6}>
            <fetcher.Form method="post">
              <input type="hidden" name="id" value={id} />
              <button
                name="liked"
                value={likedState ? "false" : "true"}
                type="submit"
                style={{ background: "none", border: "none", padding: 0 }}
              >
                <ActionIcon variant="subtle" color="gray">
                  {likedState ? (
                    <IconHeart
                      color={theme.colors.red[6]}
                      fill={theme.colors.red[6]}
                    />
                  ) : (
                    <IconHeart color={theme.colors.red[6]} />
                  )}
                </ActionIcon>
              </button>
            </fetcher.Form>

            <fetcher.Form method="post">
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                name="saved"
                value={savedState ? "false" : "true"}
                style={{ background: "none", border: "none", padding: 0 }}
              >
                <ActionIcon variant="subtle" color="gray">
                  {savedState ? (
                    <IconBookmark
                      fill={theme.colors.yellow[6]}
                      color={theme.colors.yellow[6]}
                    />
                  ) : (
                    <IconBookmark color={theme.colors.yellow[6]} />
                  )}
                </ActionIcon>
              </button>
            </fetcher.Form>
          </Group>
        </Flex>

        <Accordion>
          <Accordion.Item value="test">
            <Accordion.Control>説明</Accordion.Control>
            <Accordion.Panel>
              <Text fz="sm" c="dimmed" mt={5}>
                {description || "説明はありません"}
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Button
          component="a"
          href={playUrl}
          target="_blank"
          variant="gradient"
          gradient={{
            from: "rgba(4, 201, 47, 1)",
            to: "rgba(87, 70, 70, 1)",
            deg: 158,
          }}
          mt={"sm"}
          mx={"lg"}
        >
          Spotifyで再生する
        </Button>
      </Card>
    </>
  );
};

// gradient={{ from: 'red', to: 'rgba(87, 70, 70, 1)', deg: 158 }}
