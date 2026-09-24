import { Router, Response } from 'express';
import { prisma } from '../prisma.ts';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET reviews for a food item
router.get('/food/:foodId', async (req, res: Response) => {
  try {
    const { foodId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { foodId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ reviews });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create review (Customer only, must have ordered the food item)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { foodId, rating, comment, orderId } = req.body;
    const userId = req.user!.id;

    if (!foodId || !rating) {
      return res.status(400).json({ error: 'Food item and rating (1-5) are required' });
    }

    const ratingNum = parseInt(rating, 10);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    // Verify customer actually ordered this food item
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        foodId,
        order: {
          userId,
          status: { in: ['DELIVERED', 'COMPLETED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'] },
        },
      },
    });

    if (!hasOrdered) {
      return res.status(403).json({
        error: 'You can only review food items you have previously ordered.',
      });
    }

    // Check if user already reviewed this item
    const existing = await prisma.review.findFirst({
      where: { userId, foodId },
    });

    let review;
    if (existing) {
      review = await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating: ratingNum,
          comment: comment?.trim() || null,
          orderId: orderId || existing.orderId,
        },
      });
    } else {
      review = await prisma.review.create({
        data: {
          userId,
          foodId,
          orderId: orderId || null,
          rating: ratingNum,
          comment: comment?.trim() || null,
          userName: req.user!.name,
        },
      });
    }

    // Recalculate average rating & review count for food
    const allReviews = await prisma.review.findMany({
      where: { foodId },
      select: { rating: true },
    });

    const totalRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRatings / allReviews.length).toFixed(1));

    await prisma.food.update({
      where: { id: foodId },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    return res.status(201).json({
      review,
      avgRating,
      reviewCount: allReviews.length,
      message: 'Thank you for your rating!',
    });
  } catch (error: any) {
    console.error('Review error:', error);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Admin: GET all reviews
router.get('/admin/all', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        food: { select: { id: true, name: true, imageUrl: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json({ reviews });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
