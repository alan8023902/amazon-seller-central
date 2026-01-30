"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketService = exports.WebSocketSyncService = void 0;
const ws_1 = require("ws");
const uuid_1 = require("uuid");
class WebSocketSyncService {
    wss = null;
    clients = new Map();
    pingInterval = null;
    PING_INTERVAL = 30000;
    PONG_TIMEOUT = 5000;
    initialize(server) {
        this.wss = new ws_1.WebSocketServer({
            server,
            path: '/ws',
            clientTracking: true
        });
        this.setupConnectionHandling();
        this.startPingInterval();
        console.log('🔌 WebSocket server initialized on /ws');
    }
    setupConnectionHandling() {
        if (!this.wss)
            return;
        this.wss.on('connection', (ws, request) => {
            const clientId = (0, uuid_1.v4)();
            const client = {
                id: clientId,
                ws,
                lastPing: Date.now(),
                isAlive: true
            };
            this.clients.set(clientId, client);
            console.log(`📱 Client connected: ${clientId} (Total: ${this.clients.size})`);
            this.setupClientHandlers(client);
            this.sendToClient(client, {
                type: 'connection_status',
                storeId: '',
                dataType: 'store_info',
                data: { status: 'connected', clientId },
                timestamp: Date.now(),
                messageId: (0, uuid_1.v4)()
            });
        });
        this.wss.on('error', (error) => {
            console.error('❌ WebSocket server error:', error);
        });
    }
    setupClientHandlers(client) {
        const { ws, id } = client;
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleClientMessage(client, message);
            }
            catch (error) {
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
    handleClientMessage(client, message) {
        switch (message.type) {
            case 'ping':
                this.sendToClient(client, {
                    ...message,
                    type: 'pong',
                    timestamp: Date.now(),
                    messageId: (0, uuid_1.v4)()
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
    broadcastDataUpdate(message) {
        const broadcastMessage = {
            ...message,
            messageId: (0, uuid_1.v4)(),
            timestamp: Date.now()
        };
        let sentCount = 0;
        this.clients.forEach((client) => {
            if (!client.storeId || client.storeId === message.storeId) {
                if (this.sendToClient(client, broadcastMessage)) {
                    sentCount++;
                }
            }
        });
        console.log(`📡 Broadcasted ${message.type} for store ${message.storeId} to ${sentCount} clients`);
    }
    broadcastStoreSwitch(storeId, storeData) {
        const message = {
            type: 'store_switch',
            storeId,
            dataType: 'store_info',
            data: storeData,
            timestamp: Date.now(),
            messageId: (0, uuid_1.v4)()
        };
        this.broadcastDataUpdate(message);
    }
    sendToClient(client, message) {
        if (client.ws.readyState === ws_1.WebSocket.OPEN) {
            try {
                client.ws.send(JSON.stringify(message));
                return true;
            }
            catch (error) {
                console.error(`❌ Failed to send message to client ${client.id}:`, error);
                this.clients.delete(client.id);
                return false;
            }
        }
        return false;
    }
    sendError(client, error) {
        this.sendToClient(client, {
            type: 'connection_status',
            storeId: '',
            dataType: 'store_info',
            data: { status: 'error', error },
            timestamp: Date.now(),
            messageId: (0, uuid_1.v4)()
        });
    }
    startPingInterval() {
        this.pingInterval = setInterval(() => {
            this.clients.forEach((client, clientId) => {
                if (!client.isAlive) {
                    console.log(`💀 Terminating inactive client: ${clientId}`);
                    client.ws.terminate();
                    this.clients.delete(clientId);
                    return;
                }
                client.isAlive = false;
                if (client.ws.readyState === ws_1.WebSocket.OPEN) {
                    client.ws.ping();
                }
            });
        }, this.PING_INTERVAL);
    }
    getStats() {
        const clientsByStore = {};
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
    shutdown() {
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
exports.WebSocketSyncService = WebSocketSyncService;
exports.websocketService = new WebSocketSyncService();
