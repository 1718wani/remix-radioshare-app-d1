import { SerializeFrom } from "@remix-run/cloudflare";
import { loader as highlightsLoader } from "app/routes/highlights.$display"

export type highlightCardWithRadioshowProps = {
  highlightData: SerializeFrom<typeof highlightsLoader>["highlightsData"][number];
  isEnabledUserAction: boolean;
  open: () => void;
  onAction: (
    id: string,
    actionType: "replayed" | "saved" | "liked",
    value: boolean
  ) => void;
  onPlay: () => void;
  playing: boolean;
  handleStop: () => void;
  };