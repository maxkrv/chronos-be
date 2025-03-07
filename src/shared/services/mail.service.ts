import { Injectable } from '@nestjs/common';
import { render } from '@react-email/render';
import * as nodemailer from 'nodemailer';
import { createTransport } from 'nodemailer';
import { ReactElement, ReactNode } from 'react';

import { ApiConfigService } from '../../config/api-config.service';

interface MailOptions {
  to: string;
  subject: string;
  template: ReactElement | ReactNode;
}

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter | null = null;

  constructor(private readonly cs: ApiConfigService) {
    const mail = this.cs.getMail();
    this.transporter = createTransport(
      {
        tls: {
          rejectUnauthorized: false,
        },
        host: mail.host,
        port: mail.port,
        secure: mail.secure,
        auth: {
          user: mail.auth.user,
          pass: mail.auth.pass,
        },
      },
      {
        from: {
          name: mail.from.name,
          address: mail.from.address,
        },
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
