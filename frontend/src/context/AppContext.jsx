import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getApiBaseUrl } from '../config/api';

export const AppContext = createContext();


const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Sportsman Pro Match Football',
    category: 'Football',
    description: 'FIFA-quality match football with superior aerodynamics and textured grip. Designed for all weather conditions in Nairobi stadiums.',
    price: 3500,
    stockQuantity: 25,
    reorderThreshold: 5,
    brand: 'Sportsman',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
    warehouseLocation: 'Aisle A - Row 1',
    sizes: JSON.stringify(['Size 5 (Official)', 'Size 4 (Junior)'])
  },
  {
    id: 'prod-2',
    name: 'Nairobi Giants Official Jersey 2026',
    category: 'Jerseys',
    description: 'Breathable, sweat-wicking lightweight official team home jersey. Show your pride in Nairobi Giants style!',
    price: 2500,
    stockQuantity: 15,
    reorderThreshold: 5,
    brand: 'Sportsman',
    imageUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=500&auto=format&fit=crop&q=60',
    warehouseLocation: 'Aisle A - Row 3',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL'])
  },
  {
    id: 'prod-3',
    name: 'Elite Grip Basketball (Size 7)',
    category: 'Basketball',
    description: 'Composite leather basketball optimized for both indoor wooden courts and outdoor neighborhood courts.',
    price: 4200,
    stockQuantity: 8,
    reorderThreshold: 3,
    brand: 'Spalding',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop&q=60',
    warehouseLocation: 'Aisle B - Row 2',
    sizes: JSON.stringify(['Size 7 (Men)', 'Size 6 (Women)', 'Size 5 (Youth)'])
  },
  {
    id: 'prod-4',
    name: 'Speedster Football Boots FG',
    category: 'Boots',
    description: 'Ultralight firm-ground cleats with stud configuration engineered for explosive speed and sudden pivots.',
    price: 6800,
    stockQuantity: 4,
    reorderThreshold: 5,
    brand: 'Sportsman',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
    warehouseLocation: 'Aisle C - Row 4',
    sizes: JSON.stringify(['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'])
  },
  {
    id: 'prod-5',
    name: 'Professional Table Tennis Table',
    category: 'Table Tennis',
    description: 'Tournament-ready full-size table tennis table with premium 25mm blue playtop surface. Easily foldable.',
    price: 45000,
    stockQuantity: 2,
    reorderThreshold: 2,
    brand: 'Donic',
    imageUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?w=500&auto=format&fit=crop&q=60',
    warehouseLocation: 'Zone D - Shelf 1',
    sizes: JSON.stringify(['Standard 9x5 ft'])
  },
  {
    id: 'prod-6',
    name: 'Carbon Ping Pong Racket',
    category: 'Table Tennis',
    description: 'High-speed defensive/offensive carbon-fiber ping pong racket with premium competition ITTF rubber.',
    price: 3800,
    stockQuantity: 12,
    reorderThreshold: 4,
    brand: 'Butterfly',
    imageUrl: 'https://images.unsplash.com/photo-1511067007398-7e4b90cfa4bc?w=500&auto=format&fit=crop&q=60',
    warehouseLocation: 'Aisle B - Row 4',
    sizes: JSON.stringify(['Flared (FL)', 'Anatomic (AN)', 'Straight (ST)'])
  },
  {
    id: 'prod-7',
    name: '3-Star Table Tennis Balls (12-Pack)',
    category: 'Table Tennis',
    description: 'White seamless 40mm competition table tennis balls. Outstanding bounce, roundness and durability.',
    price: 1200,
    stockQuantity: 38,
    reorderThreshold: 10,
    brand: 'Donic',
    imageUrl: 'https://images.unsplash.com/photo-1620987278429-ca18c53d279d?w=500&auto=format&fit=crop&q=60',
    warehouseLocation: 'Aisle B - Row 5',
    sizes: JSON.stringify(['40mm (Pack of 12)'])
  },
  {
    id: 'prod-8',
    name: 'Classic Basketball Hoop Net (Pair)',
    category: 'Basketball',
    description: 'Heavy duty, all-weather white nylon replacement basketball nets. Fits standard 12-loop basketball rims.',
    price: 950,
    stockQuantity: 5,
    reorderThreshold: 3,
    brand: 'Sportsman',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&auto=format&fit=crop&q=60',
    warehouseLocation: 'Aisle B - Row 3',
    sizes: JSON.stringify(['Standard 12-Loop (Pair)'])
  }
];


const DEFAULT_COUPONS = [
  { id: 'c-1', code: 'SPORT50', discountPercentage: 50, description: '50% off flash sale' },
  { id: 'c-2', code: 'KIPCHOGE', discountPercentage: 20, description: '20% off marathon special' },
  { id: 'c-3', code: 'NAIROBI10', discountPercentage: 10, description: '10% off local delivery' }
];

const DEFAULT_QUOTATIONS = [
  {
    id: 'QT-2026-001',
    clientName: 'Coach Maurice Wambua',
    organization: "St. Mary's High School Sports Dept",
    email: 'sports@stmarysnairobi.ac.ke',
    phone: '+254 722 123 456',
    subCounty: 'Westlands',
    deliveryAddress: 'Waiyaki Way, Nairobi',
    status: 'Sent',
    validUntil: '2026-10-30',
    createdAt: new Date().toISOString(),
    items: [
      {
        product: { id: 'prod-1', name: 'Sportsman Pro Match Football', brand: 'Sportsman', price: 3500 },
        quantity: 10,
        unitPrice: 3500,
        discountPercent: 10
      },
      {
        product: { id: 'prod-5', name: 'Professional Table Tennis Table', brand: 'Donic', price: 45000 },
        quantity: 1,
        unitPrice: 45000,
        discountPercent: 5
      }
    ],
    subtotal: 74250,
    vatAmount: 11880,
    includeVat: true,
    shippingFee: 2000,
    grandTotal: 88130,
    terms: '50% deposit upon order confirmation. Balance due on delivery. Prices include 16% VAT.',
    preparedBy: 'Sportsman Corporate Admin'
  }
];

const API_BASE = getApiBaseUrl();


export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState('customer');

  useEffect(() => {
    if (user) {
      setRole(user.role);
    } else {
      setRole('customer');
    }
  }, [user]);

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('sm_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_PRODUCTS;
  });
  const [users, setUsers] = useState([]);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('sm_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('sm_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [quotations, setQuotations] = useState(() => {
    const saved = localStorage.getItem('sm_quotations');
    return saved ? JSON.parse(saved) : DEFAULT_QUOTATIONS;
  });

  // Personal Customer Wishlist state (persisted to localStorage)
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('sm_wishlist');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const [coupons, setCoupons] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch authorization headers for gated endpoints
  const getAuthHeaders = (targetRole = null) => {
    const activeRole = targetRole || role;
    const token =
      sessionStorage.getItem(`sm_token_${activeRole}`) ||
      sessionStorage.getItem('sm_token') ||
      localStorage.getItem(`sm_token_${activeRole}`) ||
      localStorage.getItem('sm_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // 1. Fetch products from NestJS server with fallback
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          try {
            localStorage.setItem('sm_products', JSON.stringify(data));
          } catch (e) {}
          return;
        }
      }
    } catch (err) {
      console.warn('Backend server down. Retaining cached catalog.', err);
    }
    // Fallback: check localStorage, otherwise DEFAULT_PRODUCTS
    const saved = localStorage.getItem('sm_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          return;
        }
      } catch (e) {}
    }
    setProducts(DEFAULT_PRODUCTS);
  };

  // 2. Fetch coupons from NestJS server with fallback
  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_BASE}/coupons`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      } else {
        setCoupons(DEFAULT_COUPONS);
      }
    } catch (err) {
      console.warn('Backend server down. Falling back to Sandbox memory coupons.', err);
      setCoupons(DEFAULT_COUPONS);
    }
  };

  // 3. Fetch/Sync orders from NestJS server
  const fetchOrders = async (targetRole = null) => {
    const activeRole = targetRole || role;
    if (activeRole === 'customer') {
      try {
        const headers = getAuthHeaders(activeRole);
        const res = await fetch(`${API_BASE}/orders/my-orders`, { headers, credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const parsedOrders = data.map(o => ({
            ...o,
            county: o.county || 'Nairobi',
            shippingFee: Number(o.shippingFee) || 0,
            exchangeRequestJson: o.exchangeRequestJson || null,
            timeline: JSON.parse(o.timelineJson || '[]'),
            items: (o.items || []).map(item => ({
              product: item.product,
              quantity: item.quantity,
              selectedSize: item.selectedSize || 'Standard'
            }))
          }));
          setOrders(parsedOrders);
          localStorage.setItem('sm_orders', JSON.stringify(parsedOrders));
          return;
        }
      } catch (err) {
        console.warn('Backend order sync failed, using local storage fallback.', err);
      }

      // Sync customer's local orders from database
      const savedOrders = localStorage.getItem('sm_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        await syncCustomerOrders(parsed);
      }
      return;
    }

    // For staff, load all database orders
    try {
      const headers = getAuthHeaders(activeRole);
      const res = await fetch(`${API_BASE}/orders`, { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const parsedOrders = data.map(o => ({
          ...o,
          county: o.county || 'Nairobi',
          shippingFee: Number(o.shippingFee) || 0,
          exchangeRequestJson: o.exchangeRequestJson || null,
          timeline: JSON.parse(o.timelineJson || '[]'),
          items: (o.items || []).map(item => ({
            product: item.product,
            quantity: item.quantity,
            selectedSize: item.selectedSize || 'Standard'
          }))
        }));
        setOrders(parsedOrders);
      }
    } catch (err) {
      console.error('Failed to load database orders for role:', activeRole, err);
    }
  };

  // Sync customer local orders from backend records
  const syncCustomerOrders = async (localOrders) => {
    if (!localOrders || localOrders.length === 0) return;
    try {
      const synced = await Promise.all(
        localOrders.map(async (order) => {
          try {
            const res = await fetch(`${API_BASE}/orders/${order.id}?email=${encodeURIComponent(order.email)}`, { credentials: 'include' });
            if (res.ok) {
              const o = await res.json();
              return {
                ...o,
                county: o.county || 'Nairobi',
                shippingFee: Number(o.shippingFee) || 0,
                exchangeRequestJson: o.exchangeRequestJson || null,
                timeline: JSON.parse(o.timelineJson || '[]'),
                items: (o.items || []).map(item => ({
                  product: item.product,
                  quantity: item.quantity,
                  selectedSize: item.selectedSize || 'Standard'
                }))
              };
            }
          } catch (e) {
            console.warn('Failed to sync order:', order.id, e);
          }
          return order;
        })
      );
      setOrders(synced);
      localStorage.setItem('sm_orders', JSON.stringify(synced));
    } catch (err) {
      console.warn('Could not sync customer tracking orders with backend.', err);
    }
  };

  // Run on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchProducts();
      await fetchCoupons();
      await fetchOrders();
      setLoading(false);
    };
    init();
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('sm_role', role);
    // Fetch orders if role changes to display the correct data in staff dashboards!
    fetchOrders(role);
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  useEffect(() => {
    localStorage.setItem('sm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sm_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Helper function to add alert notifications
  const addNotification = (type, message) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newNotif = { id, type, message, timestamp: new Date(), read: false };
    setNotifications(prev => [newNotif, ...prev]);

    // Automatically remove toast notifications after 5.5 seconds to prevent screen clutter
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5500);
  };

  // Switch Portal View
  const changeRole = (newRole) => {
    setRole(newRole);
    addNotification('info', `Switched viewing perspective to ${newRole.toUpperCase()} Portal`);
  };

  // Add item to cart with size variant support
  const addToCart = (product, quantity = 1, selectedSize = null) => {
    let finalSize = selectedSize;
    if (!finalSize) {
      try {
        const parsed = Array.isArray(product.sizes) ? product.sizes : JSON.parse(product.sizes || '[]');
        finalSize = parsed[0] || 'Standard';
      } catch {
        finalSize = 'Standard';
      }
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.product.id === product.id && (item.selectedSize || 'Standard') === finalSize
      );
      if (existingIndex > -1) {
        return prevCart.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity, selectedSize: finalSize }];
    });
    addNotification('success', `Added "${product.name}" (${finalSize}) to cart`);
  };

  // Update item quantity in cart
  const updateCartQuantity = (productId, quantity, selectedSize = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => {
        const matchesProduct = item.product.id === productId;
        const matchesSize = selectedSize ? (item.selectedSize === selectedSize) : true;
        if (matchesProduct && matchesSize) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // Remove item from cart
  const removeFromCart = (productId, selectedSize = null) => {
    const item = cart.find(i => i.product.id === productId && (!selectedSize || i.selectedSize === selectedSize));
    setCart(prevCart => prevCart.filter(item => {
      if (item.product.id !== productId) return true;
      if (selectedSize && item.selectedSize !== selectedSize) return true;
      return false;
    }));
    if (item) {
      addNotification('info', `Removed "${item.product.name}" from cart`);
    }
  };

  // Clear shopping cart
  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  // --- WISHLIST MANAGEMENT ---
  const toggleWishlist = (product) => {
    if (!product) return;
    const exists = wishlist.some(item => item.id === product.id);
    if (exists) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
      addNotification('info', `Removed "${product.name}" from your wishlist`);
    } else {
      setWishlist(prev => [product, ...prev]);
      addNotification('success', `Saved "${product.name}" to your wishlist ❤️`);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const removeFromWishlist = (productId) => {
    const item = wishlist.find(i => i.id === productId);
    setWishlist(prev => prev.filter(i => i.id !== productId));
    if (item) {
      addNotification('info', `Removed "${item.name}" from wishlist`);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    addNotification('info', 'Wishlist cleared');
  };

  // Payday Bulk Transfer: Move all items from Wishlist directly to Cart
  const moveAllToCart = () => {
    if (wishlist.length === 0) return 0;
    const count = wishlist.length;

    setCart(prevCart => {
      let updatedCart = [...prevCart];
      wishlist.forEach(product => {
        let finalSize = 'Standard';
        try {
          const parsed = Array.isArray(product.sizes) ? product.sizes : JSON.parse(product.sizes || '[]');
          finalSize = parsed[0] || 'Standard';
        } catch {
          finalSize = 'Standard';
        }

        const existingIndex = updatedCart.findIndex(
          ci => ci.product.id === product.id && (ci.selectedSize || 'Standard') === finalSize
        );
        if (existingIndex > -1) {
          updatedCart[existingIndex] = {
            ...updatedCart[existingIndex],
            quantity: updatedCart[existingIndex].quantity + 1
          };
        } else {
          updatedCart.push({ product, quantity: 1, selectedSize: finalSize });
        }
      });
      return updatedCart;
    });

    setWishlist([]);
    setIsWishlistOpen(false);
    addNotification('success', `🎉 Payday Move! ${count} item(s) moved to your cart ready for checkout!`);
    return count;
  };

  // Apply Coupon code
  const applyCoupon = (code) => {
    const found = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (found) {
      setActiveCoupon(found);
      addNotification('success', `Coupon "${found.code}" applied: ${found.discountPercentage}% discount!`);
      return { success: true, discount: found.discountPercentage };
    } else {
      addNotification('error', `Invalid or expired coupon code: "${code}"`);
      return { success: false };
    }
  };

  // Place a new Order
  const createOrder = async (customerInfo, paymentMethod, customCart = null) => {
    try {
      const itemsToOrder = customCart || cart;
      const body = {
        userId: user ? user.id : null,
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        county: customerInfo.county || 'Nairobi',
        subCounty: customerInfo.subCounty,
        shippingFee: Number(customerInfo.shippingFee) || 0,
        paymentMethod,
        cart: itemsToOrder,
        couponCode: activeCoupon ? activeCoupon.code : null
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Checkout failed.');
      }

      const rawOrder = await res.json();
      const parsedOrder = {
        ...rawOrder,
        county: rawOrder.county || customerInfo.county || 'Nairobi',
        shippingFee: Number(rawOrder.shippingFee || customerInfo.shippingFee || 0),
        exchangeRequestJson: rawOrder.exchangeRequestJson || null,
        timeline: JSON.parse(rawOrder.timelineJson || '[]'),
        items: (rawOrder.items || []).map(item => ({
          product: item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize || 'Standard'
        }))
      };

      // Apply locally
      setOrders(prev => [parsedOrder, ...prev]);
      if (!customCart) {
        clearCart();
      }

      // Trigger instant Email and SMS simulator notifications
      addNotification('email', `Order confirmation sent to ${customerInfo.email}. Ref: ${parsedOrder.id}`);
      addNotification('sms', `Sportsman: Order ${parsedOrder.id} received. Total: KES ${parsedOrder.totalAmount.toLocaleString()}. Thank you!`);

      // Refetch catalog to sync locks & stock counts
      await fetchProducts();

      return parsedOrder;
    } catch (err) {
      addNotification('error', err.message || 'Checkout failed: Stock insufficiency or database lock timeout.');
      return null;
    }
  };

  // Record In-Store / Walk-In POS Sale
  const recordWalkInSale = async (saleData) => {
    try {
      if (!saleData.items || saleData.items.length === 0) {
        throw new Error('Please select at least one product to record a walk-in sale.');
      }

      const body = {
        name: saleData.customerName?.trim() || 'Walk-in Customer',
        email: saleData.email?.trim() || 'walkin@sportsman.ke',
        phone: saleData.phone?.trim() || '+254 700 000000',
        address: saleData.notes?.trim() ? `In-Store Walk-in (${saleData.notes.trim()})` : 'In-Store Walk-in (Nairobi Retail Shop)',
        subCounty: 'In-Store Counter',
        county: 'Nairobi',
        shippingFee: 0,
        paymentMethod: saleData.paymentMethod || 'Cash',
        mpesaReference: saleData.paymentReference?.trim() || null,
        status: 'Delivered', // In-store client walks away with goods immediately
        salesChannel: 'walk_in',
        cart: saleData.items,
        discountAmount: Number(saleData.discountAmount) || 0,
        couponCode: null
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to record in-store sale.');
      }

      const rawOrder = await res.json();
      const parsedOrder = {
        ...rawOrder,
        salesChannel: 'walk_in',
        county: 'Nairobi',
        shippingFee: 0,
        status: 'Delivered',
        exchangeRequestJson: null,
        timeline: JSON.parse(rawOrder.timelineJson || '[]'),
        items: (rawOrder.items || []).map(item => ({
          product: item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize || 'Standard'
        }))
      };

      setOrders(prev => [parsedOrder, ...prev]);
      addNotification('success', `🎉 Walk-in Sale recorded! Ref: ${parsedOrder.id} • KES ${parsedOrder.totalAmount.toLocaleString()}`);

      // Sync updated stock in state
      await fetchProducts();
      return parsedOrder;
    } catch (err) {
      console.warn('Walk-in POS backend error, using local fallback:', err);
      // Fallback for offline / demo mode
      const fallbackId = `POS-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      let subtotal = 0;
      saleData.items.forEach(it => {
        subtotal += Number(it.product?.price || 0) * it.quantity;
      });
      const discount = Number(saleData.discountAmount) || 0;
      const totalAmount = Math.max(0, subtotal - discount);

      const localOrder = {
        id: fallbackId,
        customerName: saleData.customerName?.trim() || 'Walk-in Customer',
        email: saleData.email?.trim() || 'walkin@sportsman.ke',
        phone: saleData.phone?.trim() || '+254 700 000000',
        deliveryAddress: saleData.notes?.trim() ? `In-Store Walk-in (${saleData.notes.trim()})` : 'In-Store Walk-in (Nairobi Retail Shop)',
        subCounty: 'In-Store Counter',
        county: 'Nairobi',
        shippingFee: 0,
        subtotal,
        discountAmount: discount,
        totalAmount,
        status: 'Delivered',
        paymentMethod: saleData.paymentMethod || 'Cash',
        mpesaReference: saleData.paymentReference?.trim() || null,
        salesChannel: 'walk_in',
        date: new Date().toISOString(),
        timeline: [{ status: 'Delivered', date: new Date().toISOString(), message: 'In-store walk-in sale completed.' }],
        items: saleData.items
      };

      // Decrement stock in local product state
      setProducts(prev => prev.map(p => {
        const itemSold = saleData.items.find(it => it.product?.id === p.id);
        if (itemSold) {
          return { ...p, stockQuantity: Math.max(0, Number(p.stockQuantity || 0) - itemSold.quantity) };
        }
        return p;
      }));

      setOrders(prev => [localOrder, ...prev]);
      addNotification('success', `🎉 Walk-in Sale recorded! Ref: ${localOrder.id} • KES ${localOrder.totalAmount.toLocaleString()}`);
      return localOrder;
    }
  };

  // Complete Payment (mostly for M-Pesa simulator) via the public pay endpoint
  const payOrder = async (orderId, mpesaRef) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mpesaReference: mpesaRef }),
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Payment status capture failed.');
      }

      const updated = await res.json();
      const parsed = {
        ...updated,
        county: updated.county || 'Nairobi',
        shippingFee: Number(updated.shippingFee || 0),
        exchangeRequestJson: updated.exchangeRequestJson || null,
        timeline: JSON.parse(updated.timelineJson || '[]'),
        items: (updated.items || []).map(item => ({
          product: item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize || 'Standard'
        }))
      };

      setOrders(prev =>
        prev.map(order => (order.id === orderId ? parsed : order))
      );

      addNotification('sms', `M-Pesa ID ${mpesaRef} confirmed. KES ${parsed.totalAmount.toLocaleString()} paid to SPORTSMAN.KE.`);
      addNotification('success', `Payment verified successfully! Receipt Code: ${mpesaRef}`);
    } catch (err) {
      addNotification('error', err.message || 'M-Pesa payment sync failed.');
    }
  };

  // Trigger Lipa Na M-Pesa STK Push API
  const triggerMpesaPush = async (orderId, phone) => {
    try {
      const res = await fetch(`${API_BASE}/mpesa/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, phone }),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to trigger M-Pesa prompt.');
      }

      const data = await res.json();
      if (data.success) {
        addNotification('info', data.message);
        return data;
      } else {
        throw new Error(data.message || 'M-Pesa payment prompt rejected.');
      }
    } catch (err) {
      addNotification('error', err.message || 'Could not initiate STK Push.');
      return null;
    }
  };

  // Update order status across warehouse/delivery pipelines with gated controls
  const updateOrderStatus = async (orderId, newStatus, extraData = {}) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus, extraData }),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update order status.');
      }

      const updated = await res.json();
      const parsed = {
        ...updated,
        county: updated.county || 'Nairobi',
        shippingFee: Number(updated.shippingFee || 0),
        exchangeRequestJson: updated.exchangeRequestJson || null,
        timeline: JSON.parse(updated.timelineJson || '[]'),
        items: (updated.items || []).map(item => ({
          product: item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize || 'Standard'
        }))
      };

      setOrders(prev =>
        prev.map(order => (order.id === orderId ? parsed : order))
      );

      // Trigger standard alerts
      if (newStatus === 'Shipped') {
        addNotification('sms', `Sportsman: Order ${parsed.id} shipped via ${parsed.courierName}. Track with ${parsed.trackingNumber}`);
      } else if (newStatus === 'Delivered') {
        addNotification('sms', `Sportsman: Order ${parsed.id} has been delivered successfully. Rate our service!`);
      } else if (newStatus === 'Cancelled') {
        addNotification('email', `Cancellation notice for order ${parsed.id} sent to ${parsed.email}`);
        await fetchProducts();
      }

      return parsed;
    } catch (err) {
      addNotification('error', err.message || 'Workflow update rejected.');
    }
  };

  // Request size exchange (customer receipt tab)
  const requestSizeExchange = async (orderId, exchangeDto) => {
    try {
      const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };
      const res = await fetch(`${API_BASE}/orders/${orderId}/exchange`, {
        method: 'POST',
        headers,
        body: JSON.stringify(exchangeDto),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit exchange request.');
      }

      const updated = await res.json();
      const parsed = {
        ...updated,
        county: updated.county || 'Nairobi',
        shippingFee: Number(updated.shippingFee || 0),
        exchangeRequestJson: updated.exchangeRequestJson || null,
        timeline: JSON.parse(updated.timelineJson || '[]'),
        items: (updated.items || []).map(item => ({
          product: item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize || 'Standard'
        }))
      };

      setOrders(prev =>
        prev.map(order => (order.id === orderId ? parsed : order))
      );

      addNotification('success', 'Size exchange ticket created! Warehouse team has been notified.');
      return parsed;
    } catch (err) {
      addNotification('error', err.message || 'Size exchange request failed.');
      throw err;
    }
  };

  // Update exchange ticket status (warehouse / admin action)
  const updateExchangeStatus = async (orderId, exchangeStatus, staffNotes = '') => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/orders/${orderId}/exchange-status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ exchangeStatus, staffNotes }),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update exchange status.');
      }

      const updated = await res.json();
      const parsed = {
        ...updated,
        county: updated.county || 'Nairobi',
        shippingFee: Number(updated.shippingFee || 0),
        exchangeRequestJson: updated.exchangeRequestJson || null,
        timeline: JSON.parse(updated.timelineJson || '[]'),
        items: (updated.items || []).map(item => ({
          product: item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize || 'Standard'
        }))
      };

      setOrders(prev =>
        prev.map(order => (order.id === orderId ? parsed : order))
      );

      addNotification('info', `Exchange ticket marked as "${exchangeStatus}"`);
      return parsed;
    } catch (err) {
      addNotification('error', err.message || 'Failed to process exchange ticket.');
      throw err;
    }
  };

  // User CRUD (Admin gated)
  const fetchUsers = async () => {
    try {
      const headers = getAuthHeaders('admin');
      const res = await fetch(`${API_BASE}/auth/users`, { headers, credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const addUser = async (userData) => {
    try {
      const headers = getAuthHeaders('admin');
      const res = await fetch(`${API_BASE}/auth/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add user.');
      }

      await fetchUsers();
      addNotification('success', `User "${userData.name}" added successfully.`);
      return { success: true };
    } catch (err) {
      addNotification('error', err.message || 'Gated Action Denied.');
      return { success: false, error: err.message };
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const headers = getAuthHeaders('admin');
      const res = await fetch(`${API_BASE}/auth/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update user.');
      }

      await fetchUsers();
      addNotification('info', `User updated successfully.`);
      return { success: true };
    } catch (err) {
      addNotification('error', err.message || 'Gated Action Denied.');
      return { success: false, error: err.message };
    }
  };

  const deleteUser = async (userId) => {
    try {
      const headers = getAuthHeaders('admin');
      const res = await fetch(`${API_BASE}/auth/users/${userId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete user.');
      }

      await fetchUsers();
      addNotification('warning', `User deleted.`);
      return { success: true };
    } catch (err) {
      addNotification('error', err.message || 'Gated Action Denied.');
      return { success: false, error: err.message };
    }
  };

  // Product CRUD (Admin gated)
  const addProduct = async (newProd) => {
    try {
      const headers = getAuthHeaders('admin');
      if (!headers.Authorization) {
        throw new Error('Admin authorization required. Please log in at /login to save changes.');
      }
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newProd),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error('Your admin session has expired. Please log out and log in again.');
        }
        throw new Error(errorData.message || 'Product creation failed.');
      }

      const created = await res.json().catch(() => null);
      if (created) {
        setProducts(prev => {
          const next = [created, ...prev.filter(p => p.id !== created.id)];
          try { localStorage.setItem('sm_products', JSON.stringify(next)); } catch (e) {}
          return next;
        });
      }
      await fetchProducts();
      addNotification('success', `Product "${newProd.name}" added to inventory`);
      return { success: true, product: created };
    } catch (err) {
      addNotification('error', err.message || 'Gated Action Denied.');
      throw err;
    }
  };

  const updateProduct = async (updatedProd) => {
    try {
      const headers = getAuthHeaders('admin');
      if (!headers.Authorization) {
        throw new Error('Admin authorization required. Please log in at /login to save changes.');
      }
      const res = await fetch(`${API_BASE}/products/${updatedProd.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedProd),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error('Your admin session has expired. Please log out and log in again.');
        }
        throw new Error(errorData.message || 'Product modification failed.');
      }

      const saved = await res.json().catch(() => null);
      if (saved) {
        setProducts(prev => {
          const next = prev.map(p => p.id === saved.id ? saved : p);
          try { localStorage.setItem('sm_products', JSON.stringify(next)); } catch (e) {}
          return next;
        });
      }
      await fetchProducts();
      addNotification('info', `Product "${updatedProd.name}" updated successfully`);
      return { success: true, product: saved };
    } catch (err) {
      addNotification('error', err.message || 'Gated Action Denied.');
      throw err;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const headers = getAuthHeaders('admin');
      if (!headers.Authorization) {
        throw new Error('Admin authorization required. Please log in at /login to delete products.');
      }
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error('Your admin session has expired. Please log out and log in again.');
        }
        throw new Error(errorData.message || 'Product removal failed.');
      }

      setProducts(prev => {
        const next = prev.filter(p => p.id !== productId);
        try { localStorage.setItem('sm_products', JSON.stringify(next)); } catch (e) {}
        return next;
      });
      await fetchProducts();
      addNotification('warning', `Product removed from catalogue`);
      return { success: true };
    } catch (err) {
      addNotification('error', err.message || 'Gated Action Denied.');
      throw err;
    }
  };

  // Coupon CRUD (Admin gated)
  const addCoupon = async (newCoupon) => {
    try {
      const headers = getAuthHeaders('admin');
      const res = await fetch(`${API_BASE}/coupons`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newCoupon),
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Campaign coupon launch failed.');
      }

      await fetchCoupons();
      addNotification('success', `Campaign coupon "${newCoupon.code.toUpperCase()}" launched!`);
    } catch (err) {
      addNotification('error', err.message || 'Gated Action Denied.');
    }
  };

  // Quotation Management Functions
  const createQuotation = (quotationData) => {
    const nextNum = quotations.length + 1;
    const nextId = `QT-2026-${String(nextNum).padStart(3, '0')}`;
    const newQuotation = {
      id: nextId,
      createdAt: new Date().toISOString(),
      status: quotationData.status || 'Draft',
      preparedBy: user?.name || 'Sportsman Corporate Admin',
      ...quotationData
    };

    const updated = [newQuotation, ...quotations];
    setQuotations(updated);
    localStorage.setItem('sm_quotations', JSON.stringify(updated));
    addNotification('success', `Quotation ${nextId} generated successfully!`);
    return newQuotation;
  };

  const updateQuotationStatus = (id, status) => {
    const updated = quotations.map(q => q.id === id ? { ...q, status } : q);
    setQuotations(updated);
    localStorage.setItem('sm_quotations', JSON.stringify(updated));
    addNotification('info', `Quotation ${id} marked as ${status}`);
  };

  const deleteQuotation = (id) => {
    const updated = quotations.filter(q => q.id !== id);
    setQuotations(updated);
    localStorage.setItem('sm_quotations', JSON.stringify(updated));
    addNotification('warning', `Quotation ${id} removed.`);
  };

  const convertQuotationToOrder = async (quotationId) => {
    const q = quotations.find(item => item.id === quotationId);
    if (!q) return null;

    const createdOrder = await createOrder({
      name: q.clientName,
      email: q.email,
      phone: q.phone,
      address: q.deliveryAddress || 'Nairobi',
      subCounty: q.subCounty || 'Nairobi Central'
    }, 'Corporate Proforma / Bank', q.items);

    updateQuotationStatus(quotationId, 'Converted to Order');
    addNotification('success', `Quotation ${quotationId} successfully converted to live Order!`);
    return createdOrder;
  };

  return (
    <AppContext.Provider
      value={{
        API_BASE,
        role,
        changeRole,
        products,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        moveAllToCart,
        orders,
        fetchOrders,
        createOrder,
        recordWalkInSale,
        payOrder,
        triggerMpesaPush,
        updateOrderStatus,
        requestSizeExchange,
        updateExchangeStatus,
        coupons,
        addCoupon,
        activeCoupon,
        applyCoupon,
        notifications,
        addNotification,
        addProduct,
        updateProduct,
        deleteProduct,
        users,
        fetchUsers,
        addUser,
        updateUser,
        deleteUser,
        quotations,
        createQuotation,
        updateQuotationStatus,
        deleteQuotation,
        convertQuotationToOrder,
        loading
      }}
    >

      {children}
    </AppContext.Provider>
  );
};
