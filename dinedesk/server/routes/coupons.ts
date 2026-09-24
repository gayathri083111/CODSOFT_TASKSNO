import { Router, Response } from 'express';
import { prisma } from '../prisma.ts';
import { requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Validate coupon for checkout
router.post('/validate', async (req, res: Response) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.active) {
      return res.status(400).json({ error: 'Invalid or inactive coupon code' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'This coupon has expired' });
    }

    const orderSubtotal = parseFloat(subtotal) || 0;
    if (orderSubtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Discount cannot exceed subtotal
    discount = Math.min(discount, orderSubtotal);

    return res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
      },
      discount: Math.round(discount),
      message: `Coupon applied: You saved ₹${Math.round(discount)}!`,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// GET active coupons for customers
router.get('/', async (req, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ coupons });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Admin: GET all coupons
router.get('/admin', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ coupons });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Admin: Create coupon
router.post('/admin', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiresAt, active } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: 'Code, discount type, and discount value are required' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType: discountType.toUpperCase(),
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return res.status(201).json({ coupon, message: 'Coupon created successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create coupon' });
  }
});

// Admin: Toggle coupon status
router.patch('/admin/:id/toggle', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Coupon not found' });

    const updated = await prisma.coupon.update({
      where: { id },
      data: { active: !existing.active },
    });

    return res.json({ coupon: updated, message: `Coupon ${updated.active ? 'activated' : 'deactivated'}` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle coupon' });
  }
});

// Admin: Delete coupon
router.delete('/admin/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    return res.json({ message: 'Coupon deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

export default router;
