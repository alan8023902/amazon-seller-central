import { Server } from 'http';
export interface SyncMessage {
    type: 'data_update' | 'store_switch' | 'bulk_update' | 'connection_status' | 'ping' | 'pong';
    storeId: string;
    dataType: 'products' | 'dashboard' | 'sales' | 'account_health' | 'legal_entity' | 'voc_data' | 'store_info';
    data: any;
    timestamp: number;
    userId?: string;
    batchId?: string;
    sequenceNumber?: number;
    messageId: string;
}
export declare class WebSocketSyncService {
    private wss;
    private clients;
    private pingInterval;
    private readonly PING_INTERVAL;
    private readonly PONG_TIMEOUT;
    initialize(server: Server): void;
    private setupConnectionHandling;
    private setupClientHandlers;
    private handleClientMessage;
    broadcastDataUpdate(message: SyncMessage): void;
    broadcastStoreSwitch(storeId: string, storeData: any): void;
    private sendToClient;
    private sendError;
    private startPingInterval;
    getStats(): {
        totalClients: number;
        clientsByStore: Record<string, number>;
    };
    shutdown(): void;
}
export declare const websocketService: WebSocketSyncService;
//# sourceMappingURL=websocketService.d.ts.map