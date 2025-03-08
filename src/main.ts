import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { Logger } from 'nestjs-pino';
import { join } from 'path';

import { AppModule } from './app.module';
import { ApiConfigService } from './config/api-config.service';
import { GLOBAL_PREFIX, Prefix } from './utils/prefix.enum';
import { Swagger } from './utils/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = app.get(Logger);
  const cs = app.get(ApiConfigService);
  const PORT = cs.getPort();
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.enableCors();
  app.useLogger(logger);
  app.setGlobalPrefix(GLOBAL_PREFIX, { exclude: ['/'] });
  app.useStaticAssets(join(process.cwd(), 'assets'), {
    prefix: `/${GLOBAL_PREFIX}/${Prefix.ASSETS}`,
  });

  if (cs.isDevelopment()) {
    Swagger.setup(app);
  }

  await app.listen(PORT).then(() => {
    logger.log(`Server is running on port ${PORT}`);
  });
}
bootstrap();
