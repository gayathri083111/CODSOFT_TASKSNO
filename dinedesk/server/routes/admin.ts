import { Router, Response } from 'express';
import { prisma } from '../prisma.ts';
import { requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET Admin Dashboard Statistics
router.get('/dashboard', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total orders count
    const totalOrders = await prisma.order.count();

    // Today's orders count
    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: today } },
    });

    // Total revenue from all non-cancelled orders
    const allOrders = await prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { total: true, createdAt: true, status: true },
    });

    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

    // Today's revenue
    const todayRevenue = allOrders
      .filter((o) => new Date(o.createdAt) >= today)
      .reduce((sum, o) => sum + o.total, 0);

    // Total customers
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });

    // Total food items
    const totalMenuItems = await prisma.food.count();

    // Pending orders count
    const pendingOrders = await prisma.order.count({
      where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING'] } },
    });

    // Orders by status
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const ordersByStatus: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    statusCounts.forEach((sc) => {
      ordersByStatus[sc.status] = sc._count.id;
    });

    // Recent orders (last 6)
    const recentOrders = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    });

    // Popular items (aggregate order items)
    const popularItemCounts = await prisma.orderItem.groupBy({
      by: ['foodId', 'foodName', 'foodImage', 'foodType'],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const popularItems = popularItemCounts.map((item) => ({
      foodId: item.foodId,
      name: item.foodName,
      imageUrl: item.foodImage,
      foodType: item.foodType,
      soldCount: item._sum.quantity || 0,
      totalSales: item._sum.subtotal || 0,
    }));

    return res.json({
      metrics: {
        totalOrders,
        todayOrders,
        totalRevenue: Math.round(totalRevenue),
        todayRevenue: Math.round(todayRevenue),
        totalCustomers,
        totalMenuItems,
        pendingOrders,
      },
      ordersByStatus,
      recentOrders,
      popularItems,
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ error: 'Failed to generate dashboard statistics' });
  }
});

// Admin: Customers List
router.get('/customers', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedCustomers = customers.map((c) => {
      const completedOrders = c.orders.filter((o) => o.status !== 'CANCELLED');
      const totalSpending = completedOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '—',
        orderCount: c.orders.length,
        totalSpending: Math.round(totalSpending),
        joinedDate: c.createdAt,
        status: 'Active',
      };
    });

    return res.json({ customers: formattedCustomers });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

export default router;
