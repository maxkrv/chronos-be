import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailProps {
  name: string;
  link: string;
}

const ActivationLink: React.FC<EmailProps> = ({ link, name }) => (
  <Html>
    <Head />
    <Preview>Confirm your email</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          Please click the button below to verify your email address.
        </Text>
        <Section style={btnContainer}>
          <Button style={button} href={link}>
            Confirm email
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={paragraph}>
          Best,
          <br />
          The Usof team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ActivationLink;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const btnContainer = {
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#5F51E8',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};
