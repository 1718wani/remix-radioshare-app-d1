import { atom } from "jotai";
import { MutableRefObject} from "react";

export const youtubeEmbedRefAtom = atom<MutableRefObject<YT.Player | null> | null>(null);
