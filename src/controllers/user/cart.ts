import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Cart } from "../../entities/cart";
import { CartItem } from "../../entities/cart-item";
import { Product } from "../../entities/product";
import { ProductVariation } from "../../entities/product-variation";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { Repository } from "typeorm";

// src/controllers/cart.controller.ts

// Function to merge carts
async function mergeCarts(userCart: Cart, sessionCart: Cart, cartItemRepository: Repository<CartItem>, cartRepository: Repository<Cart>) {
  for (const sessionCartItem of sessionCart?.items) {
    let userCartItem = userCart.items.find(
      (item) =>
        item.product.id === sessionCartItem.product.id && item.variation?.id === sessionCartItem.variation?.id
    );
    if (userCartItem) {
      userCartItem.quantity += sessionCartItem.quantity;
      await cartItemRepository.save(userCartItem);
    } else {
      sessionCartItem.cart = userCart;
      await cartItemRepository.save(sessionCartItem);
    }
  }
  await cartRepository.remove(sessionCart);
}

export const addToCart = async (req: any, res: Response) => {
  const { productId, quantity, variationId } = req.body;
  const sessionId = req.cookies?.sessionId;
  logger.info(`SessionId from the cookie: ${sessionId}`);

  const userId = req.user?.id; // Use session ID for non-logged-in users and customer ID for logged-in users
  logger.info(`UserId from the req: ${userId}`);

  try {
    const cartRepository = getRepository(Cart);
    const cartItemRepository = getRepository(CartItem);
    const productRepository = getRepository(Product);
    const variationRepository = getRepository(ProductVariation);

    let userCart;
    let sessionCart;

    if (userId) {
      userCart = await cartRepository.findOne({
        where: { customerId: userId },
        relations: ['items', 'items.product', 'items.variation'],
      });
      sessionCart = await cartRepository.findOne({
        where: { sessionId },
        relations: ['items', 'items.product', 'items.variation'],
      });

      if (userCart && sessionCart) {
        logger.info(`Merging sessionCart into userCart for userId: ${userId}`);
        await mergeCarts(userCart, sessionCart, cartItemRepository, cartRepository);
      } else if (!userCart && sessionCart) {
        logger.info(`Assigning sessionCart to userId: ${userId}`);
        sessionCart.customerId = userId;
        sessionCart.sessionId = null;
        await cartRepository.save(sessionCart);
        userCart = sessionCart;
      } else if (!userCart && !sessionCart) {
        userCart = cartRepository.create({ customerId: userId });
        await cartRepository.save(userCart);
      }
    } else {
      sessionCart = await cartRepository.findOne({
        where: { sessionId },
        relations: ['items', 'items.product', 'items.variation'],
      });

      if (!sessionCart) {
        sessionCart = cartRepository.create({ sessionId });
        await cartRepository.save(sessionCart);
      }
      userCart = sessionCart;
    }

    const product = await productRepository.findOneBy({ id: productId });
    if (!product) {
      logger.warn(`Product not found for productId: ${productId}`);
      return ResUtil.notFound({ res, message: 'Product not found' });
    }

    let variation;
    if (variationId) {
      variation = await variationRepository.findOneBy({ id: variationId });
      if (!variation) {
        logger.warn(`Product variation not found for variationId: ${variationId}`);
        return ResUtil.notFound({
          res,
          message: 'Product variation not found',
        });
      }
    }

    let cartItem = userCart.items?.find(
      (item: CartItem) =>
        item.product.id === productId && item.variation?.id === variationId
    );
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItemRepository.save(cartItem);
    } else {
      cartItem = cartItemRepository.create({
        cart: userCart,
        product,
        variation,
        quantity,
      });
      await cartItemRepository.save(cartItem);
    }

    const updatedCart = await cartRepository.findOne({
      where: { id: userCart.id },
      relations: ['items', 'items.product', 'items.variation'],
    });

    logger.info(`Updated cart returned for ${userId ? `userId: ${userId}` : `sessionId: ${sessionId}`}`);
    return ResUtil.success({
      res,
      message: 'Item added to cart',
      data: updatedCart,
    });
  } catch (error) {
    logger.error(`Error adding to cart: ${error}`);
    return ResUtil.internalError({
      res,
      message: 'Error adding to cart',
      data: error,
    });
  }
};



export const getCartItems = async (req: any, res: Response) => {
  const sessionId = req.cookies?.sessionId;
  const userId = req.user?.id; // Use session ID for non-logged-in users and customer ID for logged-in users

  try {
    const cartRepository = getRepository(Cart);
    let cart;
    if (userId) {
      cart = await cartRepository.findOne({
        where: { userId },
        relations: ["items", "items.product", "items.variation.images"],
      });
    } else {
      cart = await cartRepository.findOne({
        where: { sessionId },
        relations: ["items", "items.product", "items.variation.images"],
      });
    }

    if (!cart) {
      return ResUtil.notFound({ res, message: "Cart not found" });
    }

    return ResUtil.success({
      res,
      message: "Cart items fetched successfully",
      data: cart.items,
    });
  } catch (error) {
    logger.error(`Error fetching cart items: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching cart items",
      data: error,
    });
  }
};

export const updateCartItem = async (req: any, res: Response) => {
  const { itemId, quantity } = req.body;
  const sessionId = req.cookies?.sessionId;
  const userId = req.user?.id;

  try {
    const cartItemRepository = getRepository(CartItem);

    const cartItem = await cartItemRepository.findOne({
      where: { id: itemId },
      relations: ["cart"],
    });

    if (
      !cartItem ||
      (cartItem.cart.sessionId !== sessionId && cartItem.cart.userId !== userId)
    ) {
      return ResUtil.notFound({ res, message: "Cart item not found" });
    }

    cartItem.quantity = quantity;
    await cartItemRepository.save(cartItem);

    return ResUtil.success({
      res,
      message: "Cart item updated",
      data: cartItem,
    });
  } catch (error) {
    logger.error(`Error updating cart item: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error updating cart item",
      data: error,
    });
  }
};

export const removeCartItem = async (req: any, res: Response) => {
  const  itemId  = req.params?.id;
  const sessionId = req.cookies?.sessionId;
  const userId = req.user?.id;

  try {
    const cartItemRepository = getRepository(CartItem);

    const cartItem = await cartItemRepository.findOne({
      where: { id: itemId },
      relations: ["cart"],
    });

    if (
      !cartItem ||
      (cartItem.cart.sessionId !== sessionId && cartItem.cart.userId !== userId)
    ) {
      return ResUtil.notFound({ res, message: "Cart item not found" });
    }

    await cartItemRepository.remove(cartItem);

    return ResUtil.success({ res, message: "Cart item removed" });
  } catch (error) {
    logger.error(`Error removing cart item: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error removing cart item",
      data: error,
    });
  }
};
