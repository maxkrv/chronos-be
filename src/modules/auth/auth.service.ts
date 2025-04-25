import { RedisService } from '@liaoliaots/nestjs-redis';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import Redis from 'ioredis';
import ActivationLink from 'src/emails/activation-link';
import ResetPasswordLink from 'src/emails/reset-password';
import { MailService } from 'src/shared/services/mail.service';

import { ApiConfigService } from '../../config/api-config.service';
import { CalendarService } from '../calendar/services/calendar.service';
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
    private readonly configService: ApiConfigService,
    private readonly mailService: MailService,
    private readonly calendarService: CalendarService,
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

    await this.calendarService.create(
      {
        name: `Main calendar`,
        isMain: true,
      },
      user.id,
    );

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
    const { sub } = await this.jwtService
      .verifyAsync<{ sub: number }>(token, {
        secret: this.configService.getAuth().mail.jwt.verification.secret,
      })
      .catch(() => {
        throw new BadRequestException('Invalid token');
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
        secret: this.configService.getAuth().mail.jwt.resetPass.secret,
      },
    );

    await this.mailService.sendMail({
      to: email,
      subject: 'Reset password',
      template: await ResetPasswordLink({
        link: `${this.configService.getApp().clientUrl}/auth/reset-password/${token}`,
        name: user.name,
      }),
    });

    return {
      success: true,
    };
  }

  async resetPassword({ token, password }: ResetPasswordDto) {
    const { sub } = await this.jwtService.verifyAsync<{ sub: number }>(token, {
      secret: this.configService.getAuth().mail.jwt.resetPass.secret,
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
        expiresIn: this.configService.getApp().jwt.accessToken.time,
        secret: this.configService.getApp().jwt.accessToken.secret,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.getApp().jwt.refreshToken.time,
        secret: this.configService.getApp().jwt.refreshToken.secret,
      }),
    ]);

    await this.redis.set(
      `${payload.sub}:${refreshToken}`,
      JSON.stringify(payload),
      'EX',
      this.convertJwtExpToSeconds(
        this.configService.getApp().jwt.refreshToken.time,
      ),
    );
    return { accessToken, refreshToken };
  }

  private convertJwtExpToSeconds(time: string) {
    const [value, unit] = time.split(/(?<=\d)(?=[a-zA-Z])/);

    switch (unit) {
      case 's':
        return +value;
      case 'm':
        return +value * 60;
      case 'h':
        return +value * 3600;
      case 'd':
        return +value * 86400;
      default:
        throw new Error('Invalid time unit');
    }
  }

  private async generateActivationLink(userId: number): Promise<string> {
    const token = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.configService.getAuth().mail.jwt.verification.secret,
      },
    );

    return `${this.configService.getApp().clientUrl}/auth/activate/${token}`;
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
