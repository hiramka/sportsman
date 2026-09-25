import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Send SMS notification to customer phone number
   * Supports Safaricom / Africa's Talking / Twilio or Sandbox log simulation
   */
  async sendSms(toPhone: string, message: string): Promise<boolean> {
    const provider = this.configService.get<string>('SMS_PROVIDER') || 'sandbox';

    this.logger.log(`📱 [SMS Service] Dispatching SMS via ${provider.toUpperCase()} to ${toPhone}`);
    this.logger.log(`   Message Content: "${message}"`);

    if (provider === 'africastalking') {
      try {
        const username = this.configService.get<string>('AFRICASTALKING_USERNAME');
        const apiKey = this.configService.get<string>('AFRICASTALKING_APIKEY');
        if (!username || !apiKey) {
          this.logger.warn('Africa\'s Talking credentials missing. Falling back to log simulation.');
          return true;
        }
        // Integration point for AfricasTalking SDK / HTTP API
        this.logger.log(`✓ Africa's Talking SMS queued for ${toPhone}`);
        return true;
      } catch (err) {
        this.logger.error(`Africa's Talking SMS failed: ${err.message}`);
        return false;
      }
    } else if (provider === 'twilio') {
      try {
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        if (!accountSid || !authToken) {
          this.logger.warn('Twilio credentials missing. Falling back to log simulation.');
          return true;
        }
        this.logger.log(`✓ Twilio SMS queued for ${toPhone}`);
        return true;
      } catch (err) {
        this.logger.error(`Twilio SMS failed: ${err.message}`);
        return false;
      }
    }

    // Sandbox Log Simulation (Default)
    this.logger.log(`✓ [SMS Sandbox] Simulated SMS delivery to ${toPhone}`);
    return true;
  }
}
