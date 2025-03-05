import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import * as nodemailer from 'nodemailer';
import { ReactElement, ReactNode } from 'react';

interface MailOptions {
  to: string;
  subject: string;
  template: ReactElement | ReactNode;
}

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport(
      {
        host: configService.get('EMAIL_HOST'),
        port: configService.get('EMAIL_PORT'),
        secure: true,
        auth: {
          user: configService.get('EMAIL_USER'),
          pass: configService.get('EMAIL_PASSWORD'),
        },
      },
      {
        from: configService.get('EMAIL_FROM'),
      },
    );
  }

  async sendMail({ template, ...rest }: MailOptions) {
    const html = await render(template as ReactElement);

    await this.transporter.sendMail({
      ...rest,
      html,
    });
  }
}
