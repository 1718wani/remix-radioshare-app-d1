import { Card, Skeleton, Grid, Flex, rem } from "@mantine/core";

export function HighlightCardSkeleton() {
  return (
    <Card withBorder padding="md" radius="md" mx="sm">
      <Skeleton height={160} mb="sm" />
      <Flex justify="space-between" align="center" mb="sm">
        <Skeleton height={20} width="40%" />
        <Skeleton height={20} width="20%" />
      </Flex>
      <Skeleton height={20} width="70%" mb="sm" />
      <Skeleton height={40} mb="sm" />
      <Flex justify="space-between" align="center">
        <Skeleton height={20} width="30%" />
        <Skeleton height={36} width="40%" radius="xl" />
      </Flex>
    </Card>
  );
}

export function HighlightsSkeleton() {
  return (
    <>
      <Flex justify="space-between" m="md" align="center">
        <Skeleton height={32} width="30%" />
        <Skeleton height={36} width={rem(120)} />
      </Flex>
      <Grid mt={10} mx="sm">
        {[...Array(6)].map((_, index) => (
          <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
            <HighlightCardSkeleton />
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
}
