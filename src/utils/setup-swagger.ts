import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GLOBAL_PREFIX, Prefix } from 'src/utils/prefix.enum';

export class Swagger {
  public static createDocument(app: NestExpressApplication) {
    const cfg = Swagger.getConfig().build();

    return SwaggerModule.createDocument(app, cfg, {
      extraModels: [],
    });
  }

  private static getConfig(): DocumentBuilder {
    return new DocumentBuilder()
      .setTitle('Chronos API')
      .setDescription('API for time menegment system')
      .setVersion('1.0')
      .setLicense('LICENSE', 'https://github.com/maxkrv/chronos-fe')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      });
  }

  public static setup(app: NestExpressApplication) {
    SwaggerModule.setup(
      `/${GLOBAL_PREFIX}/${Prefix.DOCS}`,
      app,
      Swagger.createDocument(app),
      {
        customSiteTitle: 'Chronos api docs',
        customfavIcon: '/api/assets/logo.svg',
      },
    );
  }
}
