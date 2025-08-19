import { type RefCallback, useCallback, useEffect, useRef, useState } from "react";

export function useInfiniteScroll<T>(allItems: readonly T[], batchSize: number) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelNodeRef = useRef<Element | null>(null);
    const itemsRef = useRef<readonly T[]>(allItems);
    const loadingRef = useRef(false);
    const [renderItems, setRenderItems] = useState<T[]>(allItems.slice(0, batchSize));

    useEffect(() => {
        itemsRef.current = allItems;
        loadingRef.current = false;

        setRenderItems(allItems.slice(0, batchSize));
    }, [allItems, batchSize]);

    const loadMore = useCallback(() => {
        if (loadingRef.current) {
            return;
        }

        setRenderItems((prev) => {
            if (prev.length >= itemsRef.current.length) {
                return prev;
            }

            loadingRef.current = true;
            const start = prev.length;
            const next = itemsRef.current.slice(start, start + batchSize);
            const merged = next.length ? prev.concat(next) : prev;

            // guard against rapid observer triggers while allowing React to batch state updates
            queueMicrotask(() => {
                loadingRef.current = false;
            });

            return merged;
        });
    }, [batchSize]);

    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") {
            console.error("Using an unsupported browser.");
            return;
        }

        if (observerRef.current) {
            // recreate the observer when loadMore change
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    loadMore();
                }
            },
            { root: null, rootMargin: "0px 0px 1000px 0px", threshold: 0 },
        );

        observerRef.current = observer;

        if (sentinelNodeRef.current) {
            observer.observe(sentinelNodeRef.current);
        }

        return () => {
            observer.disconnect();

            observerRef.current = null;
        };
    }, [loadMore]);

    // re-observe when the items length changes to ensure initial trigger
    // biome-ignore lint/correctness/useExhaustiveDependencies: specific trigger
    useEffect(() => {
        const observer = observerRef.current;
        const node = sentinelNodeRef.current;

        if (observer && node) {
            observer.unobserve(node);
            observer.observe(node);
        }
    }, [allItems.length]);

    // manage observing new sentinel nodes
    const sentinelRef = useCallback<RefCallback<Element>>((node) => {
        if (sentinelNodeRef.current === node) {
            return;
        }

        if (observerRef.current && sentinelNodeRef.current) {
            observerRef.current.unobserve(sentinelNodeRef.current);
        }

        sentinelNodeRef.current = node ?? null;

        if (node && observerRef.current) {
            observerRef.current.observe(node);
        }
    }, []);

    return { sentinelRef, renderItems };
}
