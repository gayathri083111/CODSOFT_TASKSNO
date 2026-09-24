import { Router, Response } from 'express';
import { prisma } from '../prisma.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET user favorites
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: {
        food: {
          include: {
            category: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const foods = favorites.map((fav) => fav.food);
    const favoriteFoodIds = favorites.map((fav) => fav.foodId);

    return res.json({ favorites: foods, favoriteFoodIds });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Toggle favorite
router.post('/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { foodId } = req.body;
    if (!foodId) {
      return res.status(400).json({ error: 'Food ID is required' });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_foodId: {
          userId: req.user!.id,
          foodId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return res.json({ isFavorite: false, message: 'Removed from favorites' });
    } else {
      await prisma.favorite.create({
        data: {
          userId: req.user!.id,
          foodId,
        },
      });
      return res.json({ isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update favorite status' });
  }
});

// DELETE favorite
router.delete('/:foodId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { foodId } = req.params;
    await prisma.favorite.deleteMany({
      where: {
        userId: req.user!.id,
        foodId,
      },
    });
    return res.json({ message: 'Removed from favorites' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;
