import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Cart } from "../../entities/cart";
import { CartItem } from "../../entities/cart-item";
import { Product } from "../../entities/product";
import { ProductVariation } from "../../entities/product-variation";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";

export const addToCart = async (req: any, res: Response) => {
  const { productId, quantity, variationId } = req.body;
  const sessionId = req.cookies?.sessionId;
  logger.info(`SessionId from the cookie:${sessionId}`);

  const userId = req.user?.id; // Use session ID for non-logged-in users and customer ID for logged-in users
  logger.info(`UserId from the req:${userId}`);

  try {
    const cartRepository = getRepository(Cart);
    const cartItemRepository = getRepository(CartItem);
    const productRepository = getRepository(Product);
    const variationRepository = getRepository(ProductVariation);

    let cart;
    if (userId) {
      cart = await cartRepository.findOne({
        where: { userId },
        relations: ["items.product"],
      }); 
    } else {
      cart = await cartRepository.findOne({
        where: { sessionId },
        relations: ["items.product"],
      });
    }

    if (!cart) {
      cart = cartRepository.create({ sessionId, userId });
      await cartRepository.save(cart);
    }

    const product = await productRepository.findOneBy({ id: productId });
    if (!product) {
      return ResUtil.notFound({ res, message: "Product not found" });
    }

    let variation;
    if (variationId) {
      variation = await variationRepository.findOneBy({ id: variationId });
      if (!variation) {
        return ResUtil.notFound({
          res,
          message: "Product variation not found",
        });
      }
    }

    let cartItem = cart.items.find(
      (item: CartItem) =>
        item.product.id === productId && item.variation?.id === variationId
    );
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItemRepository.save(cartItem);
    } else {
      cartItem = cartItemRepository.create({
        cart,
        product,
        variation,
        quantity,
      });
      await cartItemRepository.save(cartItem);
    }

    const updatedCart = await cartRepository.findOne({
      where: { id: cart?.id },
      relations: ["items", "items.product", "items.variation"],
    });
    return ResUtil.success({
      res,
      message: "Item added to cart",
      data: { cart: updatedCart },
    });
  } catch (error) {
    logger.error(`Error adding to cart: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error adding to cart",
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
  const { itemId } = req.body;
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
