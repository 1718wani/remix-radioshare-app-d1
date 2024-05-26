export type highlightCardWithRadioshowProps = {
    id: string;
    title: string;
    description: string;
    replayUrl: string;
    createdAt: string;
    createdBy: string;
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
    onPlay: () => void;
    playing:boolean;
    handleStop:() => void;
  };