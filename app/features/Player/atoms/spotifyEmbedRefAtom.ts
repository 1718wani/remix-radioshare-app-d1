import { atom } from "jotai";
import { SpotifyPlayerRef } from "../types/SpotifyIframeApiTypes";
import { RefObject } from "react";

export const spotifyEmbedRefAtom = atom<RefObject<SpotifyPlayerRef> | null>(null);
