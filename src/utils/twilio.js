import Twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

export function createTwilioClient() {
  return new Twilio(accountSid, authToken);
}
