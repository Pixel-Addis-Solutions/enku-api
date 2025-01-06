import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { Favorite } from '../../entities/favorite';
import { ResUtil } from '../../helper/response.helper';
import logger from "../../util/logger";

interface AuthRequest extends Request {
    user: {
      id: string;
    };
  };

export const createFavorite = async (req: Request, res: Response) => {
    const { productId, variationId, description } = req.body;
    const customerId = (req as AuthRequest).user.id; // Type assertion to AuthRequest

    const favoriteRepository = getRepository(Favorite);

    try {
        const favorite = favoriteRepository.create({
            customer: { id: customerId },
            product: { id: productId },
            variation: variationId ? { id: variationId } : null,
            description
        });

        await favoriteRepository.save(favorite);

        return ResUtil.success({
            res,
            message: "Product added to favorites",
            data: favorite
        });
    } catch (error: any) {
        logger.error("Error creating favorite", error);
        return ResUtil.internalError({
            res,
            message: "Error adding product to favorites",
            data: error
        });
    }
};

export const getFavorites = async (req: Request, res: Response) => {
    const customerId = (req as AuthRequest).user.id; // Type assertion to AuthRequest
    const favoriteRepository = getRepository(Favorite);

    try {
        const favorites = await favoriteRepository.find({
            where: { customer: { id: customerId } },
            relations: ['product', 'variation']
        });

        return ResUtil.success({
            res,
            message: "Favorites retrieved successfully",
            data: favorites
        });
    } catch (error: any) {
        logger.error("Error fetching favorites", error);
        return ResUtil.internalError({
            res,
            message: "Error fetching favorites",
            data: error
        });
    }
};

export const getFavoriteCount = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const favoriteRepository = getRepository(Favorite);

    try {
        const count = await favoriteRepository.count({
            where: { product: { id: productId } }
        });

        return ResUtil.success({
            res,
            message: "Favorite count retrieved successfully",
            data: { count }
        });
    } catch (error: any) {
        logger.error("Error getting favorite count", error);
        return ResUtil.internalError({
            res,
            message: "Error getting favorite count",
            data: error
        });
    }
};