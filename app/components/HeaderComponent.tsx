import {
  Box,
  Flex,
  Text,
  Burger,
} from "@mantine/core";
import { Link } from "@remix-run/react";
import { useRef } from "react";
import { SpotifyPlayer } from "~/features/Player/components/SpotifyPlayer";
import { YoutubePlayer } from "~/features/Player/components/YouTubePlayer";
import { SpotifyPlayerRef } from "~/features/Player/types/SpotifyIframeApiTypes";

type Props = {
  opened: boolean;
  toggle: () => void;
};

export const HeaderComponent = ({ opened, toggle }: Props) => {
  const spotifyPlayerRef = useRef<SpotifyPlayerRef>(null);
  return (
    <Box w={"full"} bg={"blue"} h={"60"}>
      <Flex align={"center"} justify={"space-between"} p={"xs"} px={"sm"}>
        <Link to={"/"} style={{ textDecoration: "none" }}>
          <Text fw={800} fs="italic" size="xl" c={"gray.1"}>
            RadiMoment
          </Text>
        </Link>
        <SpotifyPlayer
            ref={spotifyPlayerRef}
            uri="spotify:episode:67hjIN8AH2KiIhWiA8XyuO"
            onStop={() => console.log("ストップ")}
            width={0}
            height={0}
          />
        <Burger color="white" opened={opened} onClick={toggle} hiddenFrom="sm" size="md" />
      </Flex>
    </Box>
  );
};