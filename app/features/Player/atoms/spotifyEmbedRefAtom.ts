import { atom } from "jotai";
import { MutableRefObject } from "react";

export const spotifyEmbedRefAtom = atom<MutableRefObject<any> | null>(null);
