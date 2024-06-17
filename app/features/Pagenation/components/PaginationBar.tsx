import {  Button, Flex, rem } from "@mantine/core";
import { Link } from "@remix-run/react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useIsMobile } from "~/hooks/useIsMobile";

interface PaginationBarProps {
  display: string;
  orderBy: string;
  ascOrDesc: string;
  offset: number;
  limit: number;
  highlightsDataLength: number;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  display,
  orderBy,
  ascOrDesc,
  offset,
  limit,
  highlightsDataLength,
}: PaginationBarProps) => {
  const isMobileOS = useIsMobile();

  return (
    <Flex justify="space-between" mt="md" mx={"sm"} mb={rem(204)}>
      <Button
        size="xs"
        component={Link}
        to={`/highlights/${display}?orderBy=${orderBy}&ascOrDesc=${ascOrDesc}&offset=${Math.max(
          0,
          offset - limit
        )}`}
        disabled={offset === 0}
        variant="subtle"
        leftSection={<IconChevronLeft />}
        onClick={(e) => {
          if (offset === 0) {
            e.preventDefault(); // offsetが0の場合、リンクのデフォルト動作を防ぐ（この制御がないとButtonとしてはdisableになるが、リンクとして動作してしまう）
          }
        }}
        prefetch={isMobileOS ? "viewport" : "intent"}
      >
        もどる
      </Button>
      <Button
        size="xs"
        component={Link}
        to={`/highlights/${display}?orderBy=${orderBy}&ascOrDesc=${ascOrDesc}&offset=${
          offset + limit
        }`}
        variant="subtle"
        rightSection={<IconChevronRight />}
        disabled={highlightsDataLength < limit}
        onClick={(e) => {
          if (highlightsDataLength < limit) {
            e.preventDefault(); // highlightsDataの長さがlimit未満の場合、リンクのデフォルト動作を防ぐ(この制御がないとButtonとしてはdisableになるが、リンクとして動作してしまう)
          }
        }}
        prefetch={isMobileOS ? "viewport" : "intent"}
      >
        つぎへ
      </Button>
    </Flex>
  );
};