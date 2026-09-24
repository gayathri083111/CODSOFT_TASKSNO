import { Router, Response } from 'express';
import { prisma } from '../prisma.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Helper to get or create cart
async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          food: {
            include: {
              category: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            food: {
              include: {
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  return cart;
}

// GET user's cart
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const cart = await getOrCreateCart(req.user!.id);
    return res.json({ cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/items', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { foodId, quantity = 1 } = req.body;

    if (!foodId) {
      return res.status(400).json({ error: 'Food ID is required' });
    }

    const food = await prisma.food.findUnique({ where: { id: foodId } });
    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    if (!food.available) {
      return res.status(400).json({ error: 'This food item is currently unavailable' });
    }

    const cart = await getOrCreateCart(req.user!.id);

    // Check if item already in cart
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_foodId: {
          cartId: cart.id,
          foodId,
        },
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          foodId,
          quantity: Math.max(1, quantity),
        },
      });
    }

    const updatedCart = await getOrCreateCart(req.user!.id);
    return res.json({ cart: updatedCart, message: 'Added to cart' });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/items/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await getOrCreateCart(req.user!.id);

    const item = await prisma.cartItem.findFirst({
      where: { id, cartId: cart.id },
    });

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } });
    } else {
      await prisma.cartItem.update({
        where: { id },
        data: { quantity },
      });
    }

    const updatedCart = await getOrCreateCart(req.user!.id);
    return res.json({ cart: updatedCart });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update item quantity' });
  }
});

// Remove item from cart
router.delete('/items/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cart = await getOrCreateCart(req.user!.id);

    await prisma.cartItem.deleteMany({
      where: { id, cartId: cart.id },
    });

    const updatedCart = await getOrCreateCart(req.user!.id);
    return res.json({ cart: updatedCart, message: 'Item removed from cart' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Clear entire cart
router.delete('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const cart = await getOrCreateCart(req.user!.id);
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    const updatedCart = await getOrCreateCart(req.user!.id);
    return res.json({ cart: updatedCart, message: 'Cart cleared' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
