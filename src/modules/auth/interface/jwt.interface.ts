export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
}

export interface JwtPayloadWithRefresh extends JwtPayload {
  refreshToken: string;
}
