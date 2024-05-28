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
  Image,
  rem,
} from "@mantine/core";
import { Form, Link, useRouteLoaderData } from "@remix-run/react";
import {
  IconBookmark,
  IconHeadphones,
  IconHeart,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconTrash,
} from "@tabler/icons-react";
import { parseISO, isWithinInterval, add } from "date-fns";
import { useState } from "react";
import { customeDomain } from "~/consts/customeDomain";
import { highlightCardWithRadioshowProps } from "../types/highlightCardWithRadioshowProps";
import { loader } from "~/root";

export const HighLightCardWithRadioshow = (
  props: highlightCardWithRadioshowProps
) => {
  const {
    id,
    title,
    description,
    createdAt,
    createdBy,
    liked,
    saved,
    replayed,
    imageUrl,
    radioshowId,
    totalReplayTimes,
    isEnabledUserAction,
    startHHmmss,
    endHHmmss,
    open,
    onAction,
    onPlay,
    playing,
    handleStop,
  } = props;

  const data = useRouteLoaderData<typeof loader>("root");
  const userId = data?.user;

  const correctImageUrl = `${customeDomain}${imageUrl}`;
  const theme = useMantineTheme();

  const [likedState, setLikedState] = useState(liked);
  const [savedState, setSavedState] = useState(saved);

  const isWithinAWeek = (dateString: string) => {
    const date = parseISO(dateString);
    const now = new Date();
    const oneWeekAgo = add(now, { weeks: -1 }); // 1週間前の日付を計算
    return isWithinInterval(date, { start: oneWeekAgo, end: now });
  };

  const handleActionClick =
    (actionType: "liked" | "saved", currentState: boolean) =>
    (e: React.MouseEvent) => {
      if (!isEnabledUserAction) {
        e.preventDefault();
        open();
      } else {
        onAction(id, actionType, !currentState);
        if (actionType === "liked") {
          setLikedState(!currentState);
        } else if (actionType === "saved") {
          setSavedState(!currentState);
        }
      }
    };

  return (
    <>
      <Card withBorder padding="md" radius="md" mx={"sm"}>
        <Card.Section mb={"sm"}>
          <Link to={`/highlights/${radioshowId}`}>
            <Image
              src={correctImageUrl}
              fallbackSrc="/radiowaiting.png"
              h={160}
            />
          </Link>
        </Card.Section>
        <Flex justify={"space-between"}>
          <Group>
            {replayed && (
              <Badge w="fit-content" variant="light" c={"gray"}>
                再生済み
              </Badge>
            )}

            {isWithinAWeek(createdAt) && !replayed && (
              <Badge w="fit-content" variant="light">
                NEW !
              </Badge>
            )}
          </Group>
        </Flex>

        <Flex justify={"space-between"} align={"baseline"} mx={"sm"}>
          <Text truncate fz="md" fw={700} mt="sm">
            {title}
          </Text>
          <Group align={"center"} gap={6} wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={handleActionClick("liked", likedState)}
            >
              {likedState ? (
                <IconHeart
                  color={theme.colors.red[6]}
                  fill={theme.colors.red[6]}
                />
              ) : (
                <IconHeart color={theme.colors.red[6]} />
              )}
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={handleActionClick("saved", savedState)}
            >
              {savedState ? (
                <IconBookmark
                  fill={theme.colors.yellow[6]}
                  color={theme.colors.yellow[6]}
                />
              ) : (
                <IconBookmark color={theme.colors.yellow[6]} />
              )}
            </ActionIcon>
          </Group>
        </Flex>

        <Accordion>
          <Accordion.Item value="test">
            <Accordion.Control>
              {startHHmmss}-{endHHmmss}
            </Accordion.Control>
            <Accordion.Panel>
              <Text fz="sm" c="dimmed" mt={5}>
                {description || "説明はありません"}
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Flex
          justify="space-between"
          align={"center"}
          mt={"md"}
          style={{ width: "100%" }}
        >
          <Flex justify={"left"} pl={"sm"} align={"center"} gap={rem(3)}>
            <IconHeadphones size={20} stroke={2} color="gray" />
            <Text mt={2} size="sm" c={"gray"}>
              {totalReplayTimes}
            </Text>
          </Flex>
          <Flex align={"center"} gap={rem(8)}>
            {userId === createdBy && (
              <Form method="post" action="/highlight/delete">
                <input type="hidden" name="highlightId" value={id} />
                <ActionIcon
                  type="submit"
                  variant="light"
                  color={theme.colors.red[6]}
                  radius={"xl"}
                  onClick={(e) => {
                    if (!confirm("本当に削除しますか？")) {
                      e.preventDefault();
                    }
                  }}
                >
                  <IconTrash size={20} />
                </ActionIcon>
              </Form>
            )}

            {playing ? (
              <Button
                leftSection={
                  <IconPlayerStopFilled stroke={0.5} width={20} height={20} />
                }
                onClick={handleStop}
                radius="xl"
                bg={"gray.5"}
              >
                停止する
              </Button>
            ) : (
              <Button
                leftSection={
                  <IconPlayerPlayFilled stroke={0.5} width={20} height={20} />
                }
                onClick={() => {
                  onAction(id, "replayed", true);
                  onPlay();
                }}
                radius="xl"
                bg={"blue.5"}
              >
                再生する
              </Button>
            )}
          </Flex>
        </Flex>
      </Card>
    </>
  );
};
