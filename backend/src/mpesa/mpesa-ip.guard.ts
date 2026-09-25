import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MpesaIpGuard implements CanActivate {
  private readonly logger = new Logger(MpesaIpGuard.name);

  // Official Safaricom Daraja Production & Sandbox Callback IP Prefixes / Addresses
  private readonly safaricomIpPrefixes = [
    '196.201.214.', // 196.201.214.0/24
    '196.201.213.', // 196.201.213.0/24
    '196.201.212.', // 196.201.212.0/24
  ];

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // Extract real client IP handling reverse proxies (X-Forwarded-For)
    let rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket?.remoteAddress ||
      '';

    // Normalize IPv6-mapped IPv4 addresses (e.g., ::ffff:196.201.214.200 -> 196.201.214.200)
    if (rawIp.startsWith('::ffff:')) {
      rawIp = rawIp.replace('::ffff:', '');
    }

    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';

    // Allow localhost and local private networks in development / staging
    if (isDev) {
      if (
        !rawIp ||
        rawIp === '127.0.0.1' ||
        rawIp === '::1' ||
        rawIp.startsWith('10.') ||
        rawIp.startsWith('192.168.') ||
        rawIp.startsWith('172.')
      ) {
        this.logger.debug(`[Dev Mode] Permitted M-Pesa Callback from Local/Internal IP: ${rawIp}`);
        return true;
      }
    }

    // Check against Safaricom official IP subnets
    const isSafaricomIp = this.safaricomIpPrefixes.some(prefix => rawIp.startsWith(prefix));

    if (isSafaricomIp) {
      this.logger.log(`✓ Verified Safaricom Callback IP: ${rawIp}`);
      return true;
    }

    // Check custom environment configured whitelist (MPESA_ALLOWED_IPS)
    const customAllowedIps = this.configService.get<string>('MPESA_ALLOWED_IPS');
    if (customAllowedIps) {
      const allowedList = customAllowedIps.split(',').map(ip => ip.trim());
      if (allowedList.includes(rawIp)) {
        this.logger.log(`✓ Verified Custom Whitelisted M-Pesa Callback IP: ${rawIp}`);
        return true;
      }
    }

    this.logger.warn(`🔒 Blocked Unauthorized M-Pesa Callback Attempt from IP: ${rawIp}`);
    throw new ForbiddenException(
      `Access Denied: M-Pesa Callback request origin IP (${rawIp}) is not a verified Safaricom IP address.`,
    );
  }
}
