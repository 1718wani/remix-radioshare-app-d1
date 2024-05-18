import { FC, ReactNode, useEffect, useRef } from "react";
import { Center, Loader } from "@mantine/core";

const InfiniteScroll: FC<
  Readonly<{
    children: ReactNode;
    loadMore: () => void;
    hasNextPage: boolean;
  }>
> = ({ children, loadMore, hasNextPage }) => {
  const loadingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const loadingElement = loadingRef.current;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        loadMore();
      }
    });

    if (loadingElement) {
      observer.observe(loadingElement);
    }

    return () => {
      if (loadingElement) {
        observer.unobserve(loadingElement);
      }
    };
  }, [loadMore]);
  return (
    <>
      <div>{children}</div>
      {hasNextPage && (
        <Center>
          <Loader color="blue" ref={loadingRef} />
        </Center>
      )}
    </>
  );
};

export default InfiniteScroll;
