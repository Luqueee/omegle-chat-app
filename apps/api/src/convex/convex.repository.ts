import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@packages/backend/generated';
import { User } from '@packages/backend/models';
import { Id } from '@packages/backend/dataModel';
import { Channel } from '@packages/backend/channels';
@Injectable()
export class ConvexRepository implements OnModuleInit {
  httpClient!: ConvexHttpClient;
  SECRET!: string;
  CONVEX_URL!: string;

  constructor(private readonly configService: ConfigService) {
    this.SECRET = this.configService.get<string>('SECRET')!;
    this.CONVEX_URL = this.configService.get<string>('CONVEX_URL')!;
  }

  onModuleInit() {
    console.log(`Convex URL: ${this.CONVEX_URL}`);

    this.httpClient = new ConvexHttpClient(this.CONVEX_URL);
  }

  async validateSession(token: string) {
    // Creamos un cliente "desechable" para esta validación específica
    const authClient = new ConvexHttpClient(this.CONVEX_URL);

    // Establecemos el token que nos envió el móvil
    authClient.setAuth(token);

    try {
      // Llamamos a la query que ya tienes definida en backend/convex/auth.ts
      const user = await authClient.query(api.auth.getSessionUser);
      return user;
    } catch (error) {
      console.error('Error validating convex session:', error);
      return null;
    }
  }

  async leaveChannel(channelId: Id<'channels'>, user: User) {
    await this.httpClient.mutation(api.channels.leaveChannel, {
      secret: this.SECRET,
      channelId,
      userId: user._id,
    });
  }

  async getRoomData(channelId: Id<'channels'>) {
    const roomData = await this.httpClient.query(api.channels.getRoomData, {
      channelId,
      secret: this.SECRET,
    });
    return roomData.data;
  }
}
