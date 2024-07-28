import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { Wishlist } from '../../entities/wishlist';
import { WishlistItem } from '../../entities/wishlist-item';
import { Product } from '../../entities/product';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';

export const addProductToWishlist = async (req: Request, res: Response) => {
  const { productId } = req.body;
  const customerId = req.user?.id;

  try {
    const wishlistRepository = getRepository(Wishlist);
    const wishlistItemRepository = getRepository(WishlistItem);
    const productRepository = getRepository(Product);

    let wishlist = await wishlistRepository.findOne({ where: { customerId } });

    if (!wishlist) {
      wishlist = wishlistRepository.create({ customerId });
      await wishlistRepository.save(wishlist);
    }

    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return ResUtil.notFound({ res, message: 'Product not found' });
    }

    let wishlistItem = await wishlistItemRepository.findOne({ where: { wishlistId: wishlist.id, productId } });

    if (!wishlistItem) {
      wishlistItem = wishlistItemRepository.create({ wishlistId: wishlist.id, productId });
      await wishlistItemRepository.save(wishlistItem);
    }

    const updatedWishlist = await wishlistRepository.findOne({
      where: { id: wishlist.id },
      relations: ['items', 'items.product'],
    });

    return ResUtil.success({
      res,
      message: 'Product added to wishlist',
      data: { wishlist: updatedWishlist },
    });
  } catch (error) {
    logger.error(`Error adding product to wishlist: ${error}`);
    return ResUtil.internalError({
      res,
      message: 'Error adding product to wishlist',
      data: error,
    });
  }
};

export const removeProductFromWishlist = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const customerId = req.user?.id;

  try {
    const wishlistRepository = getRepository(Wishlist);
    const wishlistItemRepository = getRepository(WishlistItem);

    const wishlist = await wishlistRepository.findOne({ where: { customerId } });

    if (!wishlist) {
      return ResUtil.notFound({ res, message: 'Wishlist not found' });
    }

    const wishlistItem = await wishlistItemRepository.findOne({ where: { wishlistId: wishlist.id, productId } });

    if (!wishlistItem) {
      return ResUtil.notFound({ res, message: 'Product not found in wishlist' });
    }

    await wishlistItemRepository.remove(wishlistItem);

    const updatedWishlist = await wishlistRepository.findOne({
      where: { id: wishlist.id },
      relations: ['items', 'items.product'],
    });

    return ResUtil.success({
      res,
      message: 'Product removed from wishlist',
      data: { wishlist: updatedWishlist },
    });
  } catch (error) {
    logger.error(`Error removing product from wishlist: ${error}`);
    return ResUtil.internalError({
      res,
      message: 'Error removing product from wishlist',
      data: error,
    });
  }
};

export const getWishlist = async (req: Request, res: Response) => {
  const customerId = req.user?.id;

  try {
    const wishlistRepository = getRepository(Wishlist);

    const wishlist = await wishlistRepository.findOne({
      where: { customerId },
      relations: ['items', 'items.product'],
    });

    if (!wishlist) {
      return ResUtil.notFound({ res, message: 'Wishlist not found' });
    }

    return ResUtil.success({
      res,
      message: 'Wishlist fetched successfully',
      data: { wishlist },
    });
  } catch (error) {
    logger.error(`Error fetching wishlist: ${error}`);
    return ResUtil.internalError({
      res,
      message: 'Error fetching wishlist',
      data: error,
    });
  }
};
