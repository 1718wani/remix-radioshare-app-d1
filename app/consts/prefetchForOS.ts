export const prefetchForOS = (os: string) => {
    return os === "ios" || os === "android" ? "viewport" : "intent";
} 

