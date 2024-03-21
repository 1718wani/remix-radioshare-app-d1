import { createHighlightType } from "../types/createHighlightType";

export function validateHighlightData(data: Partial<createHighlightType>): asserts data is createHighlightType {
    const keys: (keyof createHighlightType)[] = ['title', 'description', 'replayUrl', 'radioshowData'];
    for (const key of keys) {
      if (data[key] === undefined) {
        throw new Error(`Property ${key} is missing in the highlight data`);
      }
    }

  }