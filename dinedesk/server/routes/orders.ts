import { Router, Response } from 'express';
import { prisma } from '../prisma.ts';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Create new order
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      addressId,
      deliveryAddressText,
      customerName,
      customerPhone,
      paymentMethod = 'COD',
      couponCode,
    } = req.body;

    const userId = req.user!.id;

    // Fetch user's cart with food items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            food: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    // Check availability of all items
    for (const item of cart.items) {
      if (!item.food.available) {
        return res.status(400).json({
          error: `"${item.food.name}" is currently unavailable. Please remove it from your cart.`,
        });
      }
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.food.price * item.quantity,
      0
    );

    // Delivery fee: ₹40, free if > ₹500
    const deliveryFee = subtotal >= 500 ? 0 : 40;

    // 5% GST restaurant tax
    const tax = Math.round(subtotal * 0.05);

    // Coupon calculation
    let discount = 0;
    let validCoupon = null;

    if (couponCode) {
      validCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (validCoupon && validCoupon.active) {
        const notExpired = !validCoupon.expiresAt || new Date(validCoupon.expiresAt) >= new Date();
        const meetsMin = subtotal >= validCoupon.minOrderAmount;

        if (notExpired && meetsMin) {
          if (validCoupon.discountType === 'PERCENTAGE') {
            discount = (subtotal * validCoupon.discountValue) / 100;
            if (validCoupon.maxDiscount && discount > validCoupon.maxDiscount) {
              discount = validCoupon.maxDiscount;
            }
          } else {
            discount = validCoupon.discountValue;
          }
          discount = Math.min(discount, subtotal);
        }
      }
    }

    const total = Math.max(0, Math.round(subtotal + deliveryFee + tax - discount));

    // Resolve delivery address text
    let finalAddressText = deliveryAddressText;
    if (addressId && !finalAddressText) {
      const addr = await prisma.address.findUnique({ where: { id: addressId } });
      if (addr) {
        finalAddressText = `${addr.label}: ${addr.street}, ${addr.city}, ${addr.state} - ${addr.postalCode} (Ph: ${addr.phone})`;
      }
    }

    if (!finalAddressText) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    // Generate unique order number: DD-YYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DD-${dateStr}-${randomHex}`;

    // Transaction to create order and items, and clear cart
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId: addressId || null,
          deliveryAddressText: finalAddressText,
          customerName: customerName || req.user!.name,
          customerEmail: req.user!.email,
          customerPhone: customerPhone || 'Not provided',
          status: 'PENDING',
          paymentMethod,
          paymentStatus: paymentMethod === 'ONLINE_MOCK' ? 'PAID' : 'PENDING',
          subtotal,
          deliveryFee,
          tax,
          discount: Math.round(discount),
          total,
          couponId: validCoupon ? validCoupon.id : null,
          couponCode: validCoupon ? validCoupon.code : null,
          estimatedDeliveryMinutes: 30 + Math.floor(Math.random() * 15),
          items: {
            create: cart.items.map((item) => ({
              foodId: item.foodId,
              foodName: item.food.name,
              foodImage: item.food.imageUrl,
              foodType: item.food.foodType,
              price: item.food.price,
              quantity: item.quantity,
              subtotal: item.food.price * item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    return res.status(201).json({
      message: 'Order placed successfully!',
      order,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
});

// GET customer orders
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch order history' });
  }
});

// GET single order by ID (customer or admin)
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            food: {
              select: {
                id: true,
                name: true,
                foodType: true,
                imageUrl: true,
                rating: true,
              },
            },
          },
        },
        reviews: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Must be the owner or admin
    if (order.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Reorder: add order items back to cart
router.post('/:id/reorder', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order || order.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get user cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
      });
    }

    // Add available items to cart
    let addedCount = 0;
    for (const item of order.items) {
      const food = await prisma.food.findUnique({ where: { id: item.foodId } });
      if (food && food.available) {
        const existing = await prisma.cartItem.findUnique({
          where: {
            cartId_foodId: {
              cartId: cart.id,
              foodId: food.id,
            },
          },
        });

        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              foodId: food.id,
              quantity: item.quantity,
            },
          });
        }
        addedCount++;
      }
    }

    return res.json({
      message: `${addedCount} items added to your cart!`,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reorder items' });
  }
});

// Admin: GET all orders
router.get('/admin/all', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { orderNumber: { contains: q } },
        { customerName: { contains: q } },
        { customerEmail: { contains: q } },
        { customerPhone: { contains: q } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch admin orders' });
  }
});

// Admin: Update order status
router.put('/:id/status', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const allowedStatuses = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(status === 'DELIVERED' && { paymentStatus: 'PAID' }),
      },
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.json({
      order,
      message: `Order status updated to ${order.status}`,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
