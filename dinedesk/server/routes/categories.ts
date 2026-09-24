import { Router, Response } from 'express';
import { prisma } from '../prisma.ts';
import { requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET all categories
router.get('/', async (req, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { foods: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      imageUrl: cat.imageUrl,
      foodCount: cat._count.foods,
      createdAt: cat.createdAt,
    }));

    return res.json({ categories: formatted });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Admin: Create category
router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, imageUrl, id } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const catId = id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = await prisma.category.create({
      data: {
        id: catId,
        name: name.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
      },
    });

    return res.status(201).json({ category, message: 'Category created' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create category' });
  }
});

// Admin: Update category
router.put('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
      },
    });

    return res.json({ category, message: 'Category updated' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

// Admin: Delete category
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id },
    });
    return res.json({ message: 'Category deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
