import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { Favorite } from '../../entities/favorite';
import { ResUtil } from '../../helper/response.helper';
import logger from "../../util/logger";
import { ProductReview } from '../../entities/product-review';

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


export const getProductReviews = async (req: Request, res: Response) => {
    const productId = req.params.productId;
    const { variationId } = req.query;
    const reviewRepository = getRepository(ProductReview);

    try {
        if (!productId) {
            return ResUtil.badRequest({
                res,
                message: "ProductId is required"
            });
        }

        const whereClause: any = {
            product: { id: productId }
        };
        
        if (variationId) {
            whereClause.variation = { id: variationId };
        }

        const reviews = await reviewRepository.find({
            where: whereClause,
            relations: ['customer', 'product', 'variation'],
            select: {
                id: true,
                rate: true,
                comment: true,
                customerId: true,
                productId: true,
                variationId: true,
                createdAt: true,
                updatedAt: true
            },
            order: {
                createdAt: 'DESC'
            }
        });

        return ResUtil.success({
            res,
            message: "Product reviews retrieved successfully",
            data: reviews
        });
    } catch (error: any) {
        logger.error("Error fetching product reviews", error);
        return ResUtil.internalError({
            res,
            message: "Error fetching product reviews",
            data: error
        });
    }
};

export const getProductAverageRating = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const reviewRepository = getRepository(ProductReview);

    try {
        const result = await reviewRepository
            .createQueryBuilder("review")
            .where("review.productId = :productId", { productId })
            .select("AVG(review.rate)", "averageRating")
            .addSelect("COUNT(*)", "totalReviews")
            .getRawOne();

        return ResUtil.success({
            res,
            message: "Product rating retrieved successfully",
            data: result
        });
    } catch (error: any) {
        logger.error("Error fetching product rating", error);
        return ResUtil.internalError({
            res,
            message: "Error fetching product rating",
            data: error
        });
    }
};