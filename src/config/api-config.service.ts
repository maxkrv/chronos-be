import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  Env,
  IApp,
  IAuth,
  IAWS,
  IConfig,
  IMail,
  IPostgeSql,
} from './config.interface';

type FieldKeyType<T> = keyof T;
type FieldType<T, K extends keyof T> = T[K];

@Injectable()
export class ApiConfigService {
  constructor(private readonly cs: ConfigService<IConfig>) {}
  public getEnv() {
    return this.getApp().env;
  }

  public getPort() {
    return this.getApp().port;
  }
  public isDevelopment(): boolean {
    return this.getEnv() === Env.DEVELOPMENT;
  }

  public isProduction(): boolean {
    return this.getEnv() === Env.PRODUCTION;
  }

  public isTest(): boolean {
    return this.getEnv() === Env.TEST;
  }

  public get<T extends FieldKeyType<IConfig>>(key: T): FieldType<IConfig, T> {
    const varbl = this.cs.get(key, {
      infer: true,
    });
    if (!varbl) throw new Error('Variables not defined');
    return varbl;
  }

  public getAWS(): IAWS {
    return this.get('aws');
  }

  public getApp(): IApp {
    return this.get('app');
  }

  public getAuth(): IAuth {
    return this.get('auth');
  }

  public getMail(): IMail {
    return this.get('mail');
  }

  public getDB(): IPostgeSql {
    return this.get('postgresql');
  }

  public getRedis() {
    return this.get('redis');
  }
}
