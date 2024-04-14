import { atom } from "jotai";
export const playingHighlightIdAtom = atom<string | null>(null);
export const spotifyStopSeconds = atom<number>(0);