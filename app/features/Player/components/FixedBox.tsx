import { Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

interface FixedBoxProps {
  id: "youtube-iframe" | "spotify-iframe";
  title: string;
  divProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const FixedBox: React.FC<FixedBoxProps> = ({ id,divProps,title }: FixedBoxProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Box
      style={{
        position: "fixed",
        right: isMobile ? "50%" : "3%",
        transform: isMobile ? "translateX(50%)" : "none",
        bottom: "3%",
        zIndex: 3,
      }}
    >
      <div
        style={{
          borderRadius: id === "youtube-iframe" ? "14px" : undefined,
          overflow: id === "youtube-iframe" ? "hidden" : undefined,
          ...divProps?.style, 
        }}
        title={title} // タイトルを追加
        id={id}
      ></div>
    </Box>
  );
};