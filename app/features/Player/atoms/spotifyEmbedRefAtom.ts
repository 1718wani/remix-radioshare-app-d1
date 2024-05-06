import { atom } from "jotai";
import { MutableRefObject } from "react";
import { SpotifyEmbedController } from "../types/SpotifyIframeApiTypes";

export const spotifyPlayerAtom = atom<MutableRefObject<SpotifyEmbedController | null> | null>(null);
