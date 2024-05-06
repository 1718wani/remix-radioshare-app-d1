import { atom } from "jotai";
import { MutableRefObject } from "react";

export const youtubePlayerAtom = atom<MutableRefObject<YT.Player | null> | null>(null);
