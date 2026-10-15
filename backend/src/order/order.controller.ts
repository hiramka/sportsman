import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  async createOrder(@Body() createDto: any) {
    return this.orderService.create(createDto);
  }

  // Admin and Staff can fetch all orders
  @Get()
  @UseGuards(AuthGuard)
  @Roles('admin', 'warehouse_staff', 'delivery_agent')
  async getAllOrders() {
    return this.orderService.findAll();
  }

  // Customers can fetch their own orders
  @Get('my-orders')
  @UseGuards(AuthGuard)
  async getMyOrders(@Req() req: any) {
    const user = req.user;
    return this.orderService.findByEmailOrPhone(user.email, user.phone);
  }

  @Get('analytics')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async getAnalytics() {
    return this.orderService.getAnalytics();
  }

  // Public package tracking by tracking number (e.g. TRK-1234567)
  @Get('track/:trackingNumber')
  async trackOrderByNumber(@Param('trackingNumber') trackingNumber: string) {
    const order = await this.orderService.findByTrackingNumber(trackingNumber);
    // Sanitize output for public tracker: return only shipping status & delivery timeline
    return {
      id: order.id,
      trackingNumber: order.trackingNumber,
      status: order.status,
      courierName: order.courierName,
      timeline: order.timelineJson ? JSON.parse(order.timelineJson) : [],
      county: order.county,
      date: order.date,
      itemCount: (order.items || []).length,
    };
  }

  @Get(':id')
  async getOrderById(
    @Param('id') id: string,
    @Req() req: any,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
  ) {
    const user = this.extractUserFromReq(req);
    const isStaff = user && ['admin', 'warehouse_staff', 'delivery_agent'].includes(user.role);

    // 1. Staff can view all orders unconditionally
    if (isStaff) {
      return this.orderService.findById(id);
    }

    // 2. Prevent ID enumeration: require verification info if unauthenticated
    if (!user && !email && !phone) {
      throw new ForbiddenException('Access Denied: Verification required to view order details.');
    }

    const order = await this.orderService.findById(id);

    // 3. Authenticated customer ownership check
    if (user) {
      const isOwner = (order.userId && order.userId === user.id) ||
                      (order.email && order.email.toLowerCase() === user.email?.toLowerCase()) ||
                      (order.phone && this.normalizePhone(order.phone) === this.normalizePhone(user.phone));
      if (isOwner) {
        return order;
      }
      throw new ForbiddenException('Access Denied: You do not have permission to view this order.');
    }

    // 4. Guest verification with null-safety and phone normalization
    if (email) {
      if (!order.email || order.email.toLowerCase() !== email.trim().toLowerCase()) {
        throw new ForbiddenException('Access Denied: Email verification failed.');
      }
    }
    if (phone) {
      if (!order.phone || this.normalizePhone(order.phone) !== this.normalizePhone(phone)) {
        throw new ForbiddenException('Access Denied: Phone verification failed.');
      }
    }

    return order;
  }

  // Customer order cancellation (only permitted while Pending Payment or Ordered)
  @Post(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { reason?: string; email?: string; phone?: string },
  ) {
    const user = this.extractUserFromReq(req);
    const order = await this.orderService.findById(id);

    if (order.status !== 'Pending Payment' && order.status !== 'Ordered') {
      throw new BadRequestException(
        `Order cannot be cancelled because it is already in "${order.status}" status.`
      );
    }

    const isStaff = user && ['admin', 'warehouse_staff'].includes(user.role);
    if (!isStaff) {
      if (user) {
        const isOwner = (order.userId && order.userId === user.id) ||
                        (order.email && order.email.toLowerCase() === user.email?.toLowerCase()) ||
                        (order.phone && this.normalizePhone(order.phone) === this.normalizePhone(user.phone));
        if (!isOwner) {
          throw new ForbiddenException('Access Denied: You cannot cancel an order that is not yours.');
        }
      } else {
        if (!body.email && !body.phone) {
          throw new ForbiddenException('Access Denied: Verification email or phone required to cancel order.');
        }
        if (body.email && (!order.email || order.email.toLowerCase() !== body.email.trim().toLowerCase())) {
          throw new ForbiddenException('Access Denied: Email verification failed.');
        }
        if (body.phone && (!order.phone || this.normalizePhone(order.phone) !== this.normalizePhone(body.phone))) {
          throw new ForbiddenException('Access Denied: Phone verification failed.');
        }
      }
    }

    return this.orderService.updateStatus(id, 'Cancelled', {
      reason: body.reason || 'Cancelled by customer',
    });
  }

  // Public payment completion endpoint for Daraja STK Push sandbox simulator
  @Put(':id/pay')
  async payOrder(
    @Param('id') id: string,
    @Body() body: { mpesaReference: string }
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Access Denied: Manual payment simulation is disabled in production.');
    }
    return this.orderService.updateStatus(id, 'Paid', { mpesaReference: body.mpesaReference });
  }

  private extractUserFromReq(req: any): any {
    if (req.user) {
      return req.user;
    }

    let token = null;
    const cookieHeader = req.headers?.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc: any, cookie: string) => {
        const [key, value] = cookie.split('=').map((c: string) => c.trim());
        if (key && value) acc[key] = value;
        return acc;
      }, {});
      token = cookies['sm_token'];
    }

    if (!token) {
      const authHeader = req.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) return null;

    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }

  private normalizePhone(phone?: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    return digits.slice(-9);
  }

  private async checkIfStaff(req: any): Promise<boolean> {
    const user = this.extractUserFromReq(req);
    return user && ['admin', 'warehouse_staff', 'delivery_agent'].includes(user.role);
  }

  // Gated status updates enforcing strict role gates in the execution context
  @Put(':id/status')
  @UseGuards(AuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; extraData?: any },
    @Req() req: any
  ) {
    const userRole = req.user.role;
    const targetStatus = body.status;

    if (targetStatus === 'Approved' || targetStatus === 'Cancelled' || targetStatus === 'Paid') {
      // Only Admin can approve, cancel, or force-pay order states
      if (userRole !== 'admin') {
        throw new ForbiddenException('Access Denied: Only Admin can approve, cancel, or force-pay orders.');
      }
    } else if (targetStatus === 'Preparing' || targetStatus === 'Ready for Shipping') {
      // Only Warehouse personnel (or Admin override) can pick and pack orders
      if (userRole !== 'warehouse_staff' && userRole !== 'admin') {
        throw new ForbiddenException('Access Denied: Only Warehouse staff can pick and pack orders.');
      }
    } else if (targetStatus === 'Shipped' || targetStatus === 'Delivered') {
      // Only Delivery personnel (or Admin override) can ship and sign handover deliveries
      if (userRole !== 'delivery_agent' && userRole !== 'admin') {
        throw new ForbiddenException('Access Denied: Only Delivery couriers can ship and complete deliveries.');
      }
    } else {
      throw new BadRequestException(`Access Denied: Unknown status code target: ${targetStatus}`);
    }

    return this.orderService.updateStatus(id, targetStatus, body.extraData || {});
  }

  // Customer size exchange request
  @Post(':id/exchange')
  async requestExchange(
    @Param('id') id: string,
    @Body() body: { itemId?: string; productName: string; currentSize: string; requestedSize: string; reason: string }
  ) {
    return this.orderService.requestSizeExchange(id, body);
  }

  // Warehouse/Admin approve or reject size exchange
  @Put(':id/exchange-status')
  @UseGuards(AuthGuard)
  async updateExchangeStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string }
  ) {
    return this.orderService.updateExchangeStatus(id, body.status, body.notes);
  }
}
