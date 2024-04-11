import { atom } from "jotai";
import { MutableRefObject } from "react";

export const youtubeEmbedRefAtom = atom<MutableRefObject<any> | null>(null);
