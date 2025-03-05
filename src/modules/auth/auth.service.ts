import { RedisService } from '@liaoliaots/nestjs-redis';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import Redis from 'ioredis';
import ActivationLink from 'src/emails/activation-link';
import ResetPasswordLink from 'src/emails/reset-password';
import { SEVEN_DAYS } from 'src/shared/constants/constants';
import { MailService } from 'src/shared/services/mail.service';

import { UserRepository } from '../user/user.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './interface/jwt.interface';

@Injectable()
export class AuthService {
  private readonly redis: Redis | null;

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('Wrong email or password');
    }

    const match = await bcrypt.compare(dto.password, user.password);

    if (!match) {
      throw new BadRequestException('Wrong email or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.generateTokenPair(payload);
  }

  async register(dto: RegisterDto) {
    const dbUser = await this.userRepository.findByEmail(dto.email);

    if (dbUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hash: string = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      ...dto,
      password: hash,
    });

    await this.mailService.sendMail({
      to: dto.email,
      subject: 'Activate your account',
      template: await ActivationLink({
        link: await this.generateActivationLink(user.id),
        name: dto.name,
      }),
    });

    return this.generateTokenPair({
      sub: user.id,
      email: user.email,
    });
  }

  async refresh(userId: number, token: string) {
    try {
      const { key } = await this.findRefreshToken(userId, token);

      await this.redis.del(key);

      const { email } = await this.userRepository.findById(userId, {
        email: true,
      });

      return this.generateTokenPair({
        sub: userId,
        email,
      });
    } catch {
      throw new ForbiddenException();
    }
  }

  async logout(userId: number, token: string) {
    const { key } = await this.findRefreshToken(userId, token);

    await this.redis.del(key);

    return {
      success: true,
    };
  }

  async activate(token: string, userId: number) {
    const { sub } = await this.jwtService.verifyAsync<{ sub: number }>(token, {
      secret: this.configService.get('JWT_ACTIVE_SECRET'),
    });

    if (sub !== userId) {
      throw new BadRequestException();
    }

    await this.userRepository.update(userId, {
      isActive: true,
    });

    return {
      success: true,
    };
  }

  async sendResetPasswordLink(email: string) {
    const user = await this.userRepository.findByEmail(email, {
      id: true,
      email: true,
      name: true,
    });

    if (!user) {
      throw new BadRequestException("User with this email doesn't exist");
    }

    const token = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get('JWT_RESET_SECRET'),
      },
    );

    await this.mailService.sendMail({
      to: email,
      subject: 'Reset password',
      template: await ResetPasswordLink({
        link: `${this.configService.get('CLIENT_URL')}/auth/reset-password/${token}`,
        name: user.name,
      }),
    });

    return {
      success: true,
    };
  }

  async resetPassword({ token, password }: ResetPasswordDto) {
    const { sub } = await this.jwtService.verifyAsync<{ sub: number }>(token, {
      secret: this.configService.get('JWT_RESET_SECRET'),
    });

    const hash: string = await bcrypt.hash(password, 10);

    await this.userRepository.update(sub, {
      password: hash,
    });

    const keys = await this.redis.keys(`${sub}:*`);

    if (keys.length) {
      await this.redis.del(keys);
    }

    return {
      success: true,
    };
  }

  private async generateTokenPair(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: this.configService.get('JWT_SECRET'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }),
    ]);

    await this.redis.set(
      `${payload.sub}:${refreshToken}`,
      JSON.stringify(payload),
      'EX',
      SEVEN_DAYS,
    );

    return { accessToken, refreshToken };
  }

  private async generateActivationLink(userId: number): Promise<string> {
    const token = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.configService.get('JWT_ACTIVE_SECRET'),
      },
    );

    return `${this.configService.get('CLIENT_URL')}/auth/activate/${token}`;
  }

  private async findRefreshToken(userId: number, token: string) {
    const key = `${userId}:${token}`;
    const dbToken = await this.redis.get(key);

    if (!dbToken) {
      throw new Error("Refresh token doesn't exist");
    }

    return { key };
  }
}
