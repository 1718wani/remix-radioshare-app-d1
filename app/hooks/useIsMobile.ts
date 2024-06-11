import { useOs } from "@mantine/hooks";

export const useIsMobile = () => {
  const os = useOs();
  return os === "ios" || os === "android";
};