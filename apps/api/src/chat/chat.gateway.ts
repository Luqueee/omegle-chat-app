import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Socket } from 'socket.io';
import { ConvexRepository } from '../convex/convex.repository';
import { User } from '@packages/backend/models';
import { Id } from '@packages/backend/dataModel';
import {
  type MESSAGE_SEND_PAYLOAD,
  WEBSOCKET_EVENTS,
} from '@packages/websocket/events';

interface CustomSocket extends Socket {
  user: User;
  chatId: Id<'channels'>;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Socket;

  constructor(
    @InjectPinoLogger(ChatGateway.name)
    private readonly logger: PinoLogger,

    private readonly convexRepository: ConvexRepository,
  ) {}

  async handleDisconnect(client: CustomSocket) {
    this.logger.info(
      `Disconnecting Client: ${client.id} from chatId (${client.chatId})`,
    );

    await this.convexRepository.leaveChannel(client.chatId, client.user);
    this.server.to(client.chatId).emit(WEBSOCKET_EVENTS.ROOM_LEAVE, {});
    client.leave(client.chatId);
  }
  async handleConnection(client: CustomSocket) {
    try {
      // 1. Extraer el token del handshake (auth object o headers)
      // El cliente debe enviarlo como { auth: { token: "..." } }
      const token = client.handshake.auth.token;

      if (!token) {
        this.logger.warn(`Client ${client.id} tried to connect without token`);
        client.disconnect();
        return;
      }

      const chatId = client.handshake.query.chatId as Id<'channels'>;
      if (!chatId || typeof chatId !== 'string') {
        this.logger.warn(`Client ${client.id} tried to connect without chatId`);
        client.disconnect();
        return;
      }

      // Limpiar "Bearer " si viene en el header
      const cleanToken = token.replace('Bearer ', '');

      // 2. Validar contra Convex
      const user = await this.convexRepository.validateSession(cleanToken);

      if (!user) {
        this.logger.warn(`Client ${client.id} provided invalid token`);
        client.disconnect();
        return;
      }

      // 3. Guardar usuario en el socket para uso futuro
      client.user = user;
      client.chatId = chatId;

      client.join(chatId);
      console.log('Client joined rooms:', client.rooms);
      const roomInfo = await this.convexRepository.getRoomData(chatId);

      this.server.to(chatId).emit(WEBSOCKET_EVENTS.ROOM_JOIN, {
        chatId: roomInfo?._id,
      });

      this.logger.info(
        `Client connected: ${client.id} to chatId (${chatId}) (User: ${user.email || user._id})`,
      );

      if (roomInfo?.user1Id && roomInfo?.user2Id) {
        this.logger.info(
          `Chat ${chatId} is full. Starting chat between users: ${roomInfo.user1Id} and ${roomInfo.user2Id}`,
        );

        this.server.to(chatId).emit(WEBSOCKET_EVENTS.ROOM_FULL);
      }

      console.log('Room info on connect:', roomInfo);
    } catch (error) {
      this.logger.error(error, 'Error during connection handshake');
      client.disconnect();
    }
  }

  @SubscribeMessage(WEBSOCKET_EVENTS.MESSAGE_SEND)
  handleMessage(client: CustomSocket, payload: MESSAGE_SEND_PAYLOAD) {
    this.logger.info(
      `Received message from client ${client.id} in chatId (${client.chatId})`,
    );
    // Aquí puedes agregar lógica para guardar el mensaje en la base de datos si es necesario

    this.server.to(client.chatId).emit(WEBSOCKET_EVENTS.MESSAGE_RECEIVE, {
      content: payload.content,
      authorId: client.user._id,
    });
  }
}
