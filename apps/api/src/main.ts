import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.flushLogs();

  const configService = app.get(ConfigService);

  app.enableCors();
  // app.setGlobalPrefix('api');

  const port = configService.get('PORT');
  const timeout = 3000;

  // console.log(
  //   `Waiting ${timeout / 1000} seconds before starting the server...`,
  // );

  // await new Promise((resolve) => setTimeout(resolve, timeout));

  console.log(`Server running on port ${port}`);
  await app.listen(port ?? 3000);
}
bootstrap();
