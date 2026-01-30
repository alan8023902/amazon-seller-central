import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';

// Message types for real-time synchronization
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

// Client connection information
interface ClientConnection {
  id: string;
  ws: WebSocket;
  userId?: string;
  storeId?: string;
  lastPing: number;
  isAlive: boolean;
}

export class WebSocketSyncService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, ClientConnection> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL = 30000; // 30 seconds
  private readonly PONG_TIMEOUT = 5000; // 5 seconds

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      clientTracking: true
    });

    this.setupConnectionHandling();
    this.startPingInterval();

    console.log('🔌 WebSocket server initialized on /ws');
  }

  /**
   * Setup WebSocket connection handling
   */
  private setupConnectionHandling(): void {
    if (!this.wss) return;

    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = uuidv4();
      const client: ClientConnection = {
        id: clientId,
        ws,
        lastPing: Date.now(),
        isAlive: true
      };

      this.clients.set(clientId, client);
      console.log(`📱 Client connected: ${clientId} (Total: ${this.clients.size})`);

      // Setup client event handlers
      this.setupClientHandlers(client);

      // Send welcome message
      this.sendToClient(client, {
        type: 'connection_status',
        storeId: '',
        dataType: 'store_info',
        data: { status: 'connected', clientId },
        timestamp: Date.now(),
        messageId: uuidv4()
      });
    });

    this.wss.on('error', (error) => {
      console.error('❌ WebSocket server error:', error);
    });
  }

  /**
   * Setup individual client event handlers
   */
  private setupClientHandlers(client: ClientConnection): void {
    const { ws, id } = client;

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as SyncMessage;
        this.handleClientMessage(client, message);
      } catch (error) {
        console.error(`❌ Invalid message from client ${id}:`, error);
        this.sendError(client, 'Invalid message format');
      }
    });

    ws.on('pong', () => {
      client.isAlive = true;
      client.lastPing = Date.now();
    });

    ws.on('close', (code, reason) => {
      console.log(`📱 Client disconnected: ${id} (Code: ${code}, Reason: ${reason})`);
      this.clients.delete(id);
    });

    ws.on('error', (error) => {
      console.error(`❌ Client ${id} error:`, error);
      this.clients.delete(id);
    });
  }

  /**
   * Handle messages from clients
   */
  private handleClientMessage(client: ClientConnection, message: SyncMessage): void {
    switch (message.type) {
      case 'ping':
        this.sendToClient(client, {
          ...message,
          type: 'pong',
          timestamp: Date.now(),
          messageId: uuidv4()
        });
        break;

      case 'store_switch':
        client.storeId = message.storeId;
        console.log(`🏪 Client ${client.id} switched to store: ${message.storeId}`);
        break;

      default:
        console.log(`📨 Received message from client ${client.id}:`, message.type);
        break;
    }
  }

  /**
   * Broadcast data update to all connected clients
   */
  broadcastDataUpdate(message: SyncMessage): void {
    const broadcastMessage = {
      ...message,
      messageId: uuidv4(),
      timestamp: Date.now()
    };

    let sentCount = 0;
    this.clients.forEach((client) => {
      // Only send to clients interested in this store
      if (!client.storeId || client.storeId === message.storeId) {
        if (this.sendToClient(client, broadcastMessage)) {
          sentCount++;
        }
      }
    });

    console.log(`📡 Broadcasted ${message.type} for store ${message.storeId} to ${sentCount} clients`);
  }

  /**
   * Broadcast store switch event
   */
  broadcastStoreSwitch(storeId: string, storeData: any): void {
    const message: SyncMessage = {
      type: 'store_switch',
      storeId,
      dataType: 'store_info',
      data: storeData,
      timestamp: Date.now(),
      messageId: uuidv4()
    };

    this.broadcastDataUpdate(message);
  }

  /**
   * Send message to specific client
   */
  private sendToClient(client: ClientConnection, message: SyncMessage): boolean {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`❌ Failed to send message to client ${client.id}:`, error);
        this.clients.delete(client.id);
        return false;
      }
    }
    return false;
  }

  /**
   * Send error message to client
   */
  private sendError(client: ClientConnection, error: string): void {
    this.sendToClient(client, {
      type: 'connection_status',
      storeId: '',
      dataType: 'store_info',
      data: { status: 'error', error },
      timestamp: Date.now(),
      messageId: uuidv4()
    });
  }

  /**
   * Start ping interval to keep connections alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          console.log(`💀 Terminating inactive client: ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
          return;
        }

        client.isAlive = false;
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.ping();
        }
      });
    }, this.PING_INTERVAL);
  }

  /**
   * Get connection statistics
   */
  getStats(): { totalClients: number; clientsByStore: Record<string, number> } {
    const clientsByStore: Record<string, number> = {};
    
    this.clients.forEach((client) => {
      if (client.storeId) {
        clientsByStore[client.storeId] = (clientsByStore[client.storeId] || 0) + 1;
      }
    });

    return {
      totalClients: this.clients.size,
      clientsByStore
    };
  }

  /**
   * Shutdown WebSocket server
   */
  shutdown(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.clients.forEach((client) => {
      client.ws.close(1000, 'Server shutdown');
    });

    if (this.wss) {
      this.wss.close(() => {
        console.log('🔌 WebSocket server closed');
      });
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketSyncService();