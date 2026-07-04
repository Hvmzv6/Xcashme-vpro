import { useState, useEffect, useCallback } from "react";

export interface QueuedSyncItem {
  id: string;
  actionType: string;
  payload: any;
  timestamp: string;
  descriptionAr: string;
  descriptionEn: string;
  retries: number;
}

const STORAGE_KEY = "xcash_pos_sync_queue";

export function useOfflineSyncQueue() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [queue, setQueue] = useState<QueuedSyncItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Load initial queue from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setQueue(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Failed to load offline sync queue:", err);
    }
  }, []);

  // Save queue to local storage when changed
  const updateQueue = useCallback((newQueue: QueuedSyncItem[]) => {
    setQueue(newQueue);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newQueue));
    } catch (err) {
      console.error("Failed to save offline sync queue:", err);
    }
  }, []);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("[OfflineSync] Connection restored. Processing queued actions...");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("[OfflineSync] Connection lost. Entering offline queue mode.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Enqueue a sync action when network request fails or when offline
  const enqueueAction = useCallback(
    (actionType: string, payload: any, descriptionAr: string, descriptionEn: string) => {
      const newItem: QueuedSyncItem = {
        id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        actionType,
        payload,
        timestamp: new Date().toISOString(),
        descriptionAr,
        descriptionEn,
        retries: 0,
      };

      setQueue((prev) => {
        const nextQueue = [...prev, newItem];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextQueue));
        } catch (e) {}
        return nextQueue;
      });

      console.log(`[OfflineSync] Action queued (${actionType}):`, newItem.id);
      return newItem.id;
    },
    []
  );

  // Remove specific action from queue
  const removeAction = useCallback((id: string) => {
    setQueue((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });
  }, []);

  // Clear entire queue
  const clearQueue = useCallback(() => {
    updateQueue([]);
  }, [updateQueue]);

  // Process and sync all pending items
  const processQueue = useCallback(async (): Promise<{ syncedCount: number; failedCount: number }> => {
    if (queue.length === 0 || !isOnline || isSyncing) {
      return { syncedCount: 0, failedCount: 0 };
    }

    setIsSyncing(true);
    let syncedCount = 0;
    let failedCount = 0;
    const remainingQueue: QueuedSyncItem[] = [];

    for (const item of queue) {
      try {
        // Send sync request to server backend
        const response = await fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionType: item.actionType,
            payload: item.payload,
            timestamp: item.timestamp,
          }),
        });

        if (response.ok) {
          syncedCount++;
        } else {
          // If server responded with error (e.g. 500), keep in queue with incremented retry count
          remainingQueue.push({ ...item, retries: item.retries + 1 });
          failedCount++;
        }
      } catch (networkErr) {
        // Still offline or network unreachable
        remainingQueue.push({ ...item, retries: item.retries + 1 });
        failedCount++;
      }
    }

    updateQueue(remainingQueue);
    setIsSyncing(false);

    if (syncedCount > 0) {
      setLastSyncTime(new Date().toLocaleTimeString());
      console.log(`[OfflineSync] Successfully synced ${syncedCount} queued actions.`);
    }

    return { syncedCount, failedCount };
  }, [queue, isOnline, isSyncing, updateQueue]);

  // Auto-process queue when online status becomes true or periodically every 25 seconds
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      const timer = setTimeout(() => {
        processQueue();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, isSyncing, processQueue]);

  return {
    isOnline,
    syncQueue: queue,
    isSyncing,
    lastSyncTime,
    enqueueAction,
    removeAction,
    clearQueue,
    processQueue,
  };
}
