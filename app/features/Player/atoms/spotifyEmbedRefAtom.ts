import { atom } from "jotai";
import { MutableRefObject } from "react";
import { SpotifyPlayerRef } from "../types/SpotifyIframeApiTypes";

export const spotifyEmbedRefAtom = atom<MutableRefObject<SpotifyPlayerRef> | null>(null);
