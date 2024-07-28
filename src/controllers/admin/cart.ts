import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { Cart } from '../../entities/cart';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';

export const getAllCarts = async (req: Request, res: Response) => {
  try {
    const cartRepository = getRepository(Cart);
    const carts = await cartRepository.find({
      relations: ['items', 'items.product', 'items.variation'],
    });

    return ResUtil.success({
      res,
      message: 'Carts fetched successfully',
      data: carts,
    });
  } catch (error) {
    logger.error(`Error fetching carts: ${error}`);
    return ResUtil.internalError({
      res,
      message: 'Error fetching carts',
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
      relations: ['items', 'items.product', 'items.variation'],
    });

    if (!cart) {
      return ResUtil.notFound({ res, message: 'Cart not found' });
    }

    return ResUtil.success({
      res,
      message: 'Cart fetched successfully',
      data: cart,
    });
  } catch (error) {
    logger.error(`Error fetching cart: ${error}`);
    return ResUtil.internalError({
      res,
      message: 'Error fetching cart',
      data: error,
    });
  }
};
