import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { ConfigModule } from '@nestjs/config';
import { ConvexRepository } from './convex/convex.repository';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        // name: 'API',
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
        // stream: pino.destination({
        //   dest: '../logs', // omit for stdout
        //   minLength: 4096, // Buffer before writing
        //   sync: false, // Asynchronous logging
        // }),
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway, ConvexRepository],
  exports: [ConvexRepository],
})
export class AppModule {}
