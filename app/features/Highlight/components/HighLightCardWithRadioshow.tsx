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
import { notifications } from "@mantine/notifications";
import { Link } from "@remix-run/react";
import {
  IconBookmark,
  IconHeadphones,
  IconHeart,
  IconX,
} from "@tabler/icons-react";
import { parseISO, isWithinInterval, add } from "date-fns";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import { customeDomain } from "~/consts/customeDomain";
import { highlights } from "~/drizzle/schema.server";
import {
  platformAtom,
  playingHighlightIdAtom,
  playingHightlightId,
} from "~/features/Player/atoms/playingStatusAtom";
import { spotifyEmbedRefAtom } from "~/features/Player/atoms/spotifyEmbedRefAtom";
import { youtubeEmbedRefAtom } from "~/features/Player/atoms/youtubeEmbedRefAtom";
import { convertHHMMSSToSeconds } from "~/features/Player/functions/convertHHmmssToSeconds";
import { convertUrlToId } from "~/features/Player/functions/convertUrlToId";

type props = {
  id: string;
  title: string;
  description: string;
  replayUrl: string;
  createdAt: string;
  liked: boolean;
  saved: boolean;
  replayed: boolean;
  imageUrl: string;
  radioshowId: string;
  totalReplayTimes: number;
  isEnabledUserAction: boolean;
  startHHmmss: string;
  endHHmmss: string;
  open: () => void;
  onAction: (
    id: string,
    actionType: "replayed" | "saved" | "liked",
    value: boolean
  ) => void;
};

export const HighLightCardWithRadioshow = (props: props) => {
  const {
    id,
    title,
    description,
    replayUrl,
    createdAt,
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
  } = props;
  const correctImageUrl = `${customeDomain}${imageUrl}`;
  const theme = useMantineTheme();

  const [likedState, setLikedState] = useState(liked);
  const [savedState, setSavedState] = useState(saved);
  const [spotifyEmbedRef] = useAtom(spotifyEmbedRefAtom);
  const [youtubeEmbedRef] = useAtom(youtubeEmbedRefAtom);
  const [playingHighlightId, setPlayingHighlightId] = useAtom(
    playingHighlightIdAtom
  );

  const handlePlayHighlight = (highlight: props) => {
    const { platform, idOrUri } = convertUrlToId(highlight.replayUrl);
    console.log(idOrUri, "idOrUri");
    if (!idOrUri) {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "再生エラーです",
        message: "登録されたURIの不備です",
        color: "red",
        icon: <IconX />,
      });
      return;
    }
    setPlayingHighlightId(highlight.id);
    if (platform === "spotify") {
      youtubeEmbedRef?.current?.stop();
      spotifyEmbedRef?.current?.playEpisode(
        idOrUri,
        convertHHMMSSToSeconds(highlight.startHHmmss)
      );
    } else if (platform === "youtube") {
      spotifyEmbedRef?.current?.stop();
      youtubeEmbedRef?.current?.changeVideo(
        idOrUri,
        convertHHMMSSToSeconds(highlight.startHHmmss)
      );
    }
  };

  const handleStopHighlight = () => {
    setPlayingHighlightId(null);
    youtubeEmbedRef?.current?.stop();
    spotifyEmbedRef?.current?.stop();
  };

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
          <Link to={`/${radioshowId}`}>
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
          <Text truncate fz="xl" fw={700} mt="sm">
            {title}
          </Text>
          <Group align={"center"} gap={6}>
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
            <Accordion.Control>説明</Accordion.Control>
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
          {playingHighlightId === id ? (
            <Button
              onClick={handleStopHighlight}
              radius="xl"
              variant="gradient"
              gradient={{
                from: theme.colors.gray[6],
                to: theme.colors.gray[4],
                deg: 158,
              }}
            >
              停止する
            </Button>
          ) : (
            <Button
              onClick={() => {
                onAction(id, "replayed", true);
                handlePlayHighlight(props);
              }}
              radius="xl"
              variant="gradient"
              gradient={{
                from: theme.colors.blue[6],
                to: theme.colors.blue[4],
                deg: 158,
              }}
            >
              再生する
            </Button>
          )}
        </Flex>
      </Card>
    </>
  );
};

// gradient={{ from: 'red', to: 'rgba(87, 70, 70, 1)', deg: 158 }}
