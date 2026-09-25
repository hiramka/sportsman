import { Controller, Post, Body, HttpCode, HttpStatus, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { MpesaService } from './mpesa.service';
import { MpesaIpGuard } from './mpesa-ip.guard';

@Controller('mpesa')
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

  // Expose STK push trigger endpoint
  @Post('stkpush')
  @HttpCode(HttpStatus.OK)
  async triggerStkPush(@Body() body: { orderId: string; phone?: string }) {
    return this.mpesaService.triggerStkPush(body.orderId, body.phone);
  }

  // Safaricom Daraja callback endpoint (Secured with Safaricom IP Whitelist Guard)
  @Post('callback')
  @UseGuards(MpesaIpGuard)
  @HttpCode(HttpStatus.OK)
  async handleCallback(
    @Body() body: any,
    @Query('secret') secretQuery?: string,
    @Req() req?: Request,
  ) {
    const clientIp = (req?.headers['x-forwarded-for'] as string) || req?.socket?.remoteAddress || '';
    const secretHeader = req?.headers['x-mpesa-secret'] as string;
    return this.mpesaService.handleCallback(body, secretQuery || secretHeader, clientIp);
  }
}
