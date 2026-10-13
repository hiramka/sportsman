import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Header } from '@nestjs/common';
import { ProductService } from './product.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get()
  async getAllProducts() {
    return this.productService.findAll();
  }

  // Meta (Facebook / Instagram Shop) & Google Merchant XML Product Catalog Feed
  @Get('meta-feed.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async getMetaFeedXml() {
    return this.productService.generateMetaFeedXml();
  }

  @Get('google-feed.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async getGoogleFeedXml() {
    return this.productService.generateMetaFeedXml();
  }

  // Meta & Google Merchant JSON Product Catalog Feed
  @Get('meta-feed.json')
  async getMetaFeedJson() {
    return this.productService.generateMetaFeedJson();
  }

  @Get('google-feed.json')
  async getGoogleFeedJson() {
    return this.productService.generateMetaFeedJson();
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Get(':id/reviews')
  async getReviews(@Param('id') id: string) {
    return this.productService.getReviews(id);
  }

  @Post(':id/reviews')
  async addReview(
    @Param('id') id: string,
    @Body() body: { userName: string; userEmail?: string; rating: number; comment: string }
  ) {
    return this.productService.addReview(id, body);
  }

  // Gated Admin PNG upload endpoint
  @Post('upload-image')
  @UseGuards(AuthGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(png|jpg|jpeg|webp|gif|svg\+xml)$/i)) {
          return callback(new BadRequestException('Invalid image format. Supported formats: PNG, JPG, WEBP, GIF, SVG.'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
    }),
  )
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No image file provided.');
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    const filename = `product-${uniqueSuffix}${ext}`;
    
    const imageUrl = await this.supabaseService.uploadImage(
      file.buffer,
      filename,
      file.mimetype,
    );
    return { imageUrl };
  }

  // Guarded Admin CRUD write operations
  @Post()
  @UseGuards(AuthGuard)
  @Roles('admin')
  async createProduct(@Body() productDto: any) {
    return this.productService.create(productDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async updateProduct(@Param('id') id: string, @Body() productDto: any) {
    return this.productService.update(id, productDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles('admin')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.delete(id);
  }
}
