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
  inviterName: string;
  calendarName: string;
  acceptLink: string;
  declineLink: string;
}

const CalendarInvitation: React.FC<EmailProps> = ({
  inviterName,
  calendarName,
  acceptLink,
  declineLink,
}) => (
  <Html>
    <Head />
    <Preview>You've been invited to a calendar</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={paragraph}>Hello,</Text>
        <Text style={paragraph}>
          <strong>{inviterName}</strong> has invited you to join the calendar "
          <strong>{calendarName}</strong>".
        </Text>
        <Text style={paragraph}>Would you like to accept the invitation?</Text>
        <Section style={btnContainer}>
          <Button style={button} href={acceptLink}>
            Accept Invitation
          </Button>
          <Button
            style={{ ...button, backgroundColor: '#E53E3E' }}
            href={declineLink}
          >
            Decline Invitation
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={paragraph}>
          Best regards, <br /> The Chronos Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default CalendarInvitation;

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
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
};

const button = {
  backgroundColor: '#5F51E8',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};
