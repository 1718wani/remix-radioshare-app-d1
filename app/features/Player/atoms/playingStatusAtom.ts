import { atom } from "jotai";

export const platformAtom = atom<"spotify" | "youtube" | null>(null);
export const isPlayingAtom = atom(false);
export const playingHightlightId = atom<string | null>(null);
