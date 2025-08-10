import { Injectable } from '@nestjs/common';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { Server } from 'http';

@Injectable()
export class ChatGateway {
  private wss: WebSocketServer;
  private clients: Map<string, any> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws) => {
      const clientId = randomUUID();
      this.clients.set(clientId, ws);

      console.log(`Client connected: ${clientId}`);
      ws.send(JSON.stringify({ type: 'init', id: clientId }));

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());

          if (msg.type === 'chat') {
            const targetClient = this.clients.get(msg.to);
            if (targetClient && targetClient.readyState === ws.OPEN) {
              targetClient.send(
                JSON.stringify({
                  type: 'chat',
                  sender: clientId,
                  message: msg.message,
                }),
              );
            }
          }
        } catch (error) {
          console.error('❌ Error parsing message', error);
        }
      });

      ws.on('close', () => {
        console.log(`❌ Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });
    });

    console.log('✅  WebSocket server running on same port as HTTP server');
  }
}
