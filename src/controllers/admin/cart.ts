import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Cart } from "../../entities/cart";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { Customer } from "../../entities/customer";
import { CartItem } from "../../entities/cart-item";

export const getAllCarts = async (req: Request, res: Response) => {
  try {
    const cartRepository = getRepository(Cart);
    const customerRepository = getRepository(Customer);
    const carts = (await cartRepository.find({
      relations: ["items", "items.product", "items.variation"],
    })) as Cart[];

    const updated = await Promise.all(
      carts.map(async (cart) => {
        let customer = null;
        if (cart?.customerId) {
          customer = await customerRepository.findOneBy({
            id: cart?.customerId,
          });
        }
        return {
          ...cart,
          customer,
        };
      })
    );
    return ResUtil.success({
      res,
      message: "Carts fetched successfully",
      data: updated,
    });
  } catch (error) {
    logger.error(`Error fetching carts: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching carts",
      data: error,
    });
  }
};

export const getCartById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const cartRepository = getRepository(Cart);
    const cart = await cartRepository.findOne({
      where: { id },
      relations: ["items", "items.product", "items.variation"],
    });

    if (!cart) {
      return ResUtil.notFound({ res, message: "Cart not found" });
    }

    return ResUtil.success({
      res,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (error) {
    logger.error(`Error fetching cart: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching cart",
      data: error,
    });
  }
};

export const removeCart = async (req: any, res: Response) => {
  const itemId = req.params?.id;

  try {
    const cartRepository = getRepository(Cart);
    const cartItemRepository = getRepository(CartItem);

    // Find the cart and its items
    const cart = await cartRepository.findOne({
      where: { id: itemId },
      relations: ["items"],
    });

    if (!cart) {
      return ResUtil.notFound({ res, message: "Cart not found" });
    }

    // Remove associated CartItems first
    if (cart.items && cart.items.length > 0) {
      await cartItemRepository.remove(cart.items);
    }

    // Now remove the Cart itself
    await cartRepository.remove(cart);

    return ResUtil.success({ res, message: "Cart removed successfully" });
  } catch (error) {
    logger.error(`Error removing cart item: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error removing cart item",
      data: error,
    });
  }
};
