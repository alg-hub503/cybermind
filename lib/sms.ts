export interface SmsProvider {
  send(phone: string, message: string): Promise<void>;
}

class ConsoleSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<void> {
    console.log(`[SMS] To: ${phone}`);
    console.log(`[SMS] Message: ${message}`);
  }
}

function getSmsProvider(): SmsProvider {
  const provider = process.env.SMS_PROVIDER ?? "console";

  switch (provider) {
    case "console":
      return new ConsoleSmsProvider();
    default:
      console.warn(`Unknown SMS provider: ${provider}, falling back to console`);
      return new ConsoleSmsProvider();
  }
}

const provider = getSmsProvider();

export async function sendSms(phone: string, message: string): Promise<void> {
  return provider.send(phone, message);
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
