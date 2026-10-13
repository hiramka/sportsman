import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/Product.entity';
import { Review } from '../entities/Review.entity';
import Redis from 'ioredis';

@Injectable()
export class ProductService implements OnModuleDestroy {
  private redisClient: Redis | null = null;
  private memoryCache = new Map<string, string>(); // Sandbox Memory Cache Fallback
  private useRedis = false;
  private hasWarnedRedis = false;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {
    this.initializeRedis();
  }

  // Gracefully initialize Redis sandbox driver
  private initializeRedis() {
    const host = process.env.REDIS_HOST;
    const port = parseInt(process.env.REDIS_PORT, 10) || 6379;

    if (!host) {
      console.log('⚡ Redis host not configured. Falling back to local high-speed memory cache.');
      this.useRedis = false;
      return;
    }

    console.log(`🔌 Initializing Redis cache on redis://${host}:${port}...`);
    
    try {
      this.redisClient = new Redis({
        host,
        port,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            // End reconnecting
            return null;
          }
          return Math.min(times * 100, 1000);
        }
      });

      this.redisClient.on('connect', () => {
        this.useRedis = true;
        this.hasWarnedRedis = false;
        console.log('✓ Redis cache connection established successfully.');
      });

      this.redisClient.on('error', (err) => {
        this.useRedis = false;
        if (!this.hasWarnedRedis) {
          console.log('⚠️ Redis server not available. Falling back to local high-speed memory cache.');
          this.hasWarnedRedis = true;
        }
      });
    } catch (err) {
      this.useRedis = false;
      if (!this.hasWarnedRedis) {
        console.log('⚠️ Redis server initialization failed. Falling back to memory cache.');
        this.hasWarnedRedis = true;
      }
    }
  }

  // Gracefully close client on shutdown
  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  // Evict cache keys
  async evictCache() {
    const key = 'cache:products:all';
    if (this.useRedis && this.redisClient) {
      await this.redisClient.del(key);
      console.log(`⚡ Redis: Evicted cache index key: "${key}"`);
    } else {
      this.memoryCache.delete(key);
      console.log(`⚡ MemoryCache: Evicted cache index key: "${key}"`);
    }
  }

  // Fetch all catalog items with high-speed caching!
  async findAll() {
    const cacheKey = 'cache:products:all';
    
    // 1. Check Caching Layer
    if (this.useRedis && this.redisClient) {
      try {
        const cachedData = await this.redisClient.get(cacheKey);
        if (cachedData) {
          console.log('⚡ Redis Cache HIT: Fetched catalog products instantly.');
          return JSON.parse(cachedData);
        }
      } catch (err) {
        console.log('⚠️ Redis lookup error, falling back to database query.');
      }
    } else {
      const cachedData = this.memoryCache.get(cacheKey);
      if (cachedData) {
        console.log('⚡ MemoryCache HIT: Fetched catalog products instantly.');
        return JSON.parse(cachedData);
      }
    }

    // 2. Cache MISS: Query Database
    console.log('⚡ Cache MISS: Querying PostgreSQL database catalog...');
    const products = await this.productRepository.find();

    // 3. Save to Caching Layer (TTL: 5 minutes / 300s)
    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.set(cacheKey, JSON.stringify(products), 'EX', 300);
      } catch (err) {
        console.log('⚠️ Failed to write catalog payload to Redis.');
      }
    } else {
      this.memoryCache.set(cacheKey, JSON.stringify(products));
    }

    return products;
  }

  async findById(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  // Write Operation: Create Product (Evicts cache!)
  async create(productDto: any) {
    const product = this.productRepository.create({
      id: `prod-${Date.now()}`,
      name: productDto.name,
      category: productDto.category,
      description: productDto.description,
      price: Number(productDto.price),
      stockQuantity: Number(productDto.stockQuantity),
      reorderThreshold: Number(productDto.reorderThreshold || 3),
      brand: productDto.brand,
      imageUrl: productDto.imageUrl,
      warehouseLocation: productDto.warehouseLocation,
      sizes: typeof productDto.sizes === 'string' ? productDto.sizes : JSON.stringify(productDto.sizes || ['Standard']),
    });

    const saved = await this.productRepository.save(product);
    await this.evictCache(); // Invalidate cache index
    return saved;
  }

  // Write Operation: Update Product (Evicts cache!)
  async update(id: string, productDto: any) {
    const product = await this.findById(id);
    
    product.name = productDto.name;
    product.category = productDto.category;
    product.description = productDto.description;
    product.price = Number(productDto.price);
    product.stockQuantity = Number(productDto.stockQuantity);
    product.reorderThreshold = Number(productDto.reorderThreshold || 3);
    product.brand = productDto.brand;
    product.imageUrl = productDto.imageUrl;
    product.warehouseLocation = productDto.warehouseLocation;
    if (productDto.sizes !== undefined) {
      product.sizes = typeof productDto.sizes === 'string' ? productDto.sizes : JSON.stringify(productDto.sizes || ['Standard']);
    }

    const saved = await this.productRepository.save(product);
    await this.evictCache(); // Invalidate cache index
    return saved;
  }

  // Write Operation: Delete Product (Evicts cache!)
  async delete(id: string) {
    const product = await this.findById(id);
    await this.productRepository.remove(product);
    await this.evictCache(); // Invalidate cache index
    return { success: true, message: `Product "${product.name}" removed.` };
  }

  // Fetch all reviews for a product with rating statistics
  async getReviews(productId: string) {
    const reviews = await this.reviewRepository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });

    const total = reviews.length;
    const averageRating = total > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
      : 5.0;

    return {
      reviews,
      totalReviews: total,
      averageRating,
    };
  }

  // Create a new product review
  async addReview(productId: string, dto: { userName: string; userEmail?: string; rating: number; comment: string }) {
    await this.findById(productId); // Ensure product exists

    const review = this.reviewRepository.create({
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId,
      userName: dto.userName || 'Anonymous Fan',
      userEmail: dto.userEmail || null,
      rating: Math.min(5, Math.max(1, Number(dto.rating) || 5)),
      comment: dto.comment,
      createdAt: new Date().toISOString(),
    });

    return await this.reviewRepository.save(review);
  }

  // Generate Meta (Facebook/Instagram) & Google Merchant XML Product Feed
  async generateMetaFeedXml(): Promise<string> {
    const products = await this.productRepository.find();
    const escapeXml = (str: any) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const itemsXml = products.map(p => {
      let sizeVal = 'Standard';
      if (p.sizes) {
        try {
          const parsed = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes;
          if (Array.isArray(parsed) && parsed.length > 0) sizeVal = parsed.join(', ');
        } catch (e) {
          sizeVal = String(p.sizes);
        }
      }

      const formatImageUrl = (url?: string) => {
        if (!url) return 'https://sportsman.ke/logo.png';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://sportsman.ke${url.startsWith('/') ? '' : '/'}${url}`;
      };

      const imgLink = formatImageUrl(p.imageUrl);
      const inStock = p.stockQuantity > 0 ? 'in stock' : 'out of stock';
      const desc = p.description || `${p.name} by ${p.brand || 'Sportsman'}. Authentic sports gear in Nairobi, Kenya.`;

      return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>https://sportsman.ke/?product=${escapeXml(p.id)}</g:link>
      <g:image_link>${escapeXml(imgLink)}</g:image_link>
      <g:brand>${escapeXml(p.brand || 'Sportsman')}</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${inStock}</g:availability>
      <g:price>${Number(p.price || 0).toFixed(2)} KES</g:price>
      <g:product_type>${escapeXml(p.category || 'Sports Equipment')}</g:product_type>
      <g:google_product_category>Sporting Goods &gt; Athletics</g:google_product_category>
      <g:size>${escapeXml(sizeVal)}</g:size>
      <g:custom_label_0>${escapeXml(p.warehouseLocation || 'Nairobi Central')}</g:custom_label_0>
      <g:inventory>${p.stockQuantity}</g:inventory>
    </item>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Sportsman.ke Official Product Catalog Feed</title>
    <link>https://sportsman.ke</link>
    <description>Live product catalog for Meta (Facebook/Instagram Shop) and Google Merchant Center Kenya</description>
${itemsXml}
  </channel>
</rss>`;
  }

  // Generate Meta & Google Merchant JSON Catalog Feed
  async generateMetaFeedJson() {
    const products = await this.productRepository.find();
    const formatImageUrl = (url?: string) => {
      if (!url) return 'https://sportsman.ke/logo.png';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `https://sportsman.ke${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return {
      title: 'Sportsman.ke Product Feed',
      link: 'https://sportsman.ke',
      updatedAt: new Date().toISOString(),
      itemCount: products.length,
      products: products.map(p => {
        let sizeVal = ['Standard'];
        if (p.sizes) {
          try {
            const parsed = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes;
            if (Array.isArray(parsed) && parsed.length > 0) sizeVal = parsed;
          } catch (e) {
            sizeVal = [String(p.sizes)];
          }
        }

        return {
          id: p.id,
          title: p.name,
          description: p.description || `${p.name} - Official Sportsman.ke gear`,
          link: `https://sportsman.ke/?product=${p.id}`,
          image_link: formatImageUrl(p.imageUrl),
          brand: p.brand || 'Sportsman',
          condition: 'new',
          availability: p.stockQuantity > 0 ? 'in stock' : 'out of stock',
          price: `${Number(p.price || 0).toFixed(2)} KES`,
          product_type: p.category || 'Sports Equipment',
          sizes: sizeVal,
          inventory: p.stockQuantity,
          warehouse_location: p.warehouseLocation || 'Nairobi Central'
        };
      })
    };
  }
}

