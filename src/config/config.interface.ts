export enum Env {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export interface IConfig {
  postgresql: IPostgeSql;
  aws: IAWS;
  app: IApp;
  mail: IMail;
  auth: IAuth;
  redis: IRedis;
}

export interface IPostgeSql {
  port: number;
  host: string;
  password: string;
  user: string;
  databaseName: string;
}

export interface IRedis {
  port: number;
  host: string;
  password: string;
  user: string;
}

export interface IAWS {
  s3: { region: string; keyId: string; secretKey: string; bucketName: string };
}
export interface IJWTOpt {
  secret: string;
  time: string;
}

export interface IJWT {
  accessToken: IJWTOpt;
  refreshToken: IJWTOpt;
}

export interface IApp {
  env: Env;
  port: number;
  clientUrl: string;
  nagerUrl: string;
  jwt: IJWT;
  throttle: {
    ttl: number;
    limit: number;
  };
}
export interface IMail {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    address: string;
  };
}

export interface IAuth {
  mail: {
    jwt: {
      verification: IJWTOpt;
      resetPass: IJWTOpt;
    };
  };
  google: {
    clientId: string;
    clientSecret: string;
    callbackURL: string;
  };
}
