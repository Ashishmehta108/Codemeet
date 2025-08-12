// events.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(private userService: UserService) { }
  private clients: Set<string> = new Set();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.clients.add(client.id);

    this.clients.forEach((id) => {
      if (id !== client.id) {
        client.emit('new-peer', { peerId: id });
      }
    });

    client.broadcast.emit('new-peer', { peerId: client.id });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
    this.server.emit('peer-disconnected', { peerId: client.id });
  }

  @SubscribeMessage('offer')
  handleOffer(client: Socket, payload: { target: string; sdp: any }) {
    this.server.to(payload.target).emit('offer', {
      sdp: payload.sdp,
      from: client.id,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, payload: { target: string; answer: any }) {
    this.server.to(payload.target).emit('answer', {
      answer: payload.answer,
      from: client.id,
    });
  }

  @SubscribeMessage('candidate')
  handleCandidate(client: Socket, payload: { target: string; candidate: any }) {
    this.server.to(payload.target).emit('candidate', {
      candidate: payload.candidate,
      from: client.id,
    });
  }

  @SubscribeMessage('call')
  async handleCall(
    client: Socket,
    payload: { target: string; offer: any; sender: string },
  ) {
    const socketId = await this.userService.getUserByEmail(payload.target);
    console.log(`Call from ${client.id} to ${socketId.socketId}`);
    this.server
      .to(socketId.socketId)
      .emit('call', { sender: payload.sender, offer: payload.offer });
  }

  @SubscribeMessage("updateFile")
  async handleFileUpdate(
    client: Socket,
    payload: { file: string, fileName: string },
  ) {

    // const socketId = await this.userService.getUserByEmail(payload.target);
    // console.log(`Call from ${client.id} to ${socketId.socketId}`);
    console.log(payload.file, payload.fileName)
    // this.server
    //   .to(socketId.socketId)
    // .emit('call', { sender: payload.sender, offer: payload.offer });
  }
}

