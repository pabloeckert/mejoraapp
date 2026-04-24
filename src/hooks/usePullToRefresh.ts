/**
 * usePullToRefresh — Hook para pull-to-refresh en móvil
 *
 * Maneja touch events, umbral de activación, y estados de pull.
 */

import { useState, useCallback, useRef } from "react";

interface PullToRefreshOptions {
  threshold?: number;
  onRefresh: () => Promise<void> | void;
}

export function usePullToRefresh({ threshold = 80, onRefresh }: PullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling) return;
      const diff = e.touches[0].clientY - touchStartY.current;
      if (diff > 0) {
        setPullDistance(Math.min(diff * 0.5, 120));
      }
    },
    [isPulling]
  );

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    isReady: pullDistance >= threshold,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
