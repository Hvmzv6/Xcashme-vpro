export interface SyncRequestPayload {
    branchId?: string;
    localEvents?: unknown[];
    actionType?: string;
    timestamp?: string;
    requestId?: string;
    retryCount?: number;
    payload?: {
        conflict?: boolean;
        serverVersion?: number;
    };
}

const processedRequestIds = new Set<string>();

export function buildSyncResponse(payload: SyncRequestPayload) {
    const { branchId, localEvents, actionType, timestamp, requestId, retryCount = 0 } = payload;

    if (requestId && processedRequestIds.has(requestId)) {
        return {
            status: "success",
            syncedAction: actionType || "BATCH",
            globalSequence: Date.now(),
            duplicate: true
        };
    }

    if (payload.payload?.conflict) {
        return {
            status: "conflict",
            message: "Remote state conflict detected.",
            retryable: true,
            retryAfterMs: Math.min(30000, 2000 * (retryCount + 1))
        };
    }

    if (actionType) {
        console.log(`[POS Server Sync] Processed offline queued action: [${actionType}] at ${timestamp}`);
    } else {
        console.log(`[POS Server Sync] Received batch sync (${localEvents?.length || 0} events) from branch: ${branchId || "Main"}`);
    }

    if (requestId) {
        processedRequestIds.add(requestId);
    }

    return {
        status: "success",
        timestamp: new Date().toISOString(),
        syncedAction: actionType || "BATCH",
        globalSequence: Date.now(),
        retryCount
    };
}

export function resetSyncStateForTests() {
    processedRequestIds.clear();
}
