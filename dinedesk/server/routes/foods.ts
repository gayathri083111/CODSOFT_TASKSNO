import { Router, Response } from 'express';
import { prisma } from '../prisma.ts';
import { requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET all foods with filters
router.get('/', async (req, res: Response) => {
  try {
    const {
      category,
      foodType,
      search,
      minRating,
      maxPrice,
      sortBy,
      featured,
      availableOnly,
    } = req.query;

    const where: any = {};

    if (availableOnly !== 'false') {
      where.available = true;
    }

    if (category && category !== 'all') {
      where.categoryId = String(category);
    }

    if (foodType && foodType !== 'all') {
      where.foodType = String(foodType).toUpperCase();
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (minRating) {
      where.rating = { gte: parseFloat(String(minRating)) };
    }

    if (maxPrice) {
      where.price = { lte: parseFloat(String(maxPrice)) };
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'name') {
      orderBy = { name: 'asc' };
    }

    const foods = await prisma.food.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy,
    });

    return res.json({ foods });
  } catch (error: any) {
    console.error('Error fetching foods:', error);
    return res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

// GET single food by ID
router.get('/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;
    const food = await prisma.food.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    return res.json({ food });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch food item' });
  }
});

// Admin: Create food item
router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      foodType,
      imageUrl,
      preparationTime,
      available,
      featured,
    } = req.body;

    if (!name || !price || !categoryId || !foodType || !imageUrl) {
      return res.status(400).json({ error: 'Name, price, category, food type, and image URL are required' });
    }

    const food = await prisma.food.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        price: parseFloat(price),
        categoryId,
        foodType: foodType.toUpperCase(),
        imageUrl: imageUrl.trim(),
        preparationTime: preparationTime || '25-30 min',
        available: available !== undefined ? Boolean(available) : true,
        featured: featured !== undefined ? Boolean(featured) : false,
      },
      include: {
        category: true,
      },
    });

    return res.status(201).json({ food, message: 'Food item created successfully' });
  } catch (error: any) {
    console.error('Error creating food:', error);
    return res.status(500).json({ error: 'Failed to create food item' });
  }
});

// Admin: Update food item
router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      categoryId,
      foodType,
      imageUrl,
      preparationTime,
      available,
      featured,
    } = req.body;

    const existing = await prisma.food.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const updated = await prisma.food.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(categoryId && { categoryId }),
        ...(foodType && { foodType: foodType.toUpperCase() }),
        ...(imageUrl && { imageUrl: imageUrl.trim() }),
        ...(preparationTime && { preparationTime }),
        ...(available !== undefined && { available: Boolean(available) }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
      },
      include: {
        category: true,
      },
    });

    return res.json({ food: updated, message: 'Food item updated successfully' });
  } catch (error: any) {
    console.error('Error updating food:', error);
    return res.status(500).json({ error: 'Failed to update food item' });
  }
});

// Admin: Toggle availability
router.patch('/:id/availability', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.food.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const updated = await prisma.food.update({
      where: { id },
      data: { available: !existing.available },
    });

    return res.json({ food: updated, message: `Item is now ${updated.available ? 'available' : 'unavailable'}` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle availability' });
  }
});

// Admin: Delete food item
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.food.delete({
      where: { id },
    });
    return res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete food item' });
  }
});

export default router;
