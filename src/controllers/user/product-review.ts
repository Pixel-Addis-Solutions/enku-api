import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { ProductReview } from "../../entities/product-review";
import { Product } from "../../entities/product";
import { User } from "../../entities/user";
import { ProductVariation } from "../../entities/product-variation";
import logger from "../../util/logger";
import { ResUtil } from "../../helper/response.helper";

/**
 * Create a new review
 * POST /reviews
 */
export const createReview = async (req: Request, res: Response): Promise<Response> => {
  const { customerId, comment, rate, productId, variationId } = req.body;

  try {
    const reviewRepository = getRepository(ProductReview);
    const productRepository = getRepository(Product);
    const userRepository = getRepository(User);
    const variationRepository = getRepository(ProductVariation);

    // Validate product
    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      logger.warn(`Invalid product ID: ${productId}`);
      ResUtil.badRequest({
        res,
        message: "Invalid product ID.",
      });
      return res;
    }

    // Validate customer
    const customer = await userRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      logger.warn(`Invalid customer ID: ${customerId}`);
      ResUtil.badRequest({
        res,
        message: "Invalid customer ID.",
      });
      return res;
    }

    // Validate variation (optional)
    if (variationId) {
      const variation = await variationRepository.findOne({ where: { id: variationId } });
      if (!variation) {
        logger.warn(`Invalid variation ID: ${variationId}`);
        ResUtil.badRequest({
          res,
          message: "Invalid variation ID.",
        });
        return res;
      }
    }

    // Validate rating value
    if (rate < 0 || rate > 5) {
      logger.warn(`Invalid rating value: ${rate}`);
      ResUtil.badRequest({
        res,
        message: "Rating must be between 0 and 5.",
      });
      return res;
    }

    // Create and save review
    const newReview = reviewRepository.create({
      customerId,
      comment,
      rate,
      productId,
      variationId,
    });
    const savedReview = await reviewRepository.save(newReview);

    logger.info(`Review created successfully for product ID: ${productId}`);
    ResUtil.success({
      res,
      message: "Review created successfully.",
      data: savedReview,
    });
    return res;
  } catch (error) {
    logger.error(`Error creating review - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    ResUtil.badRequest({
      res,
      message: "Error creating review.",
      data: (error as Error).message,
    });
    return res;
  }
};

/**
 * Get all reviews for a product
 * GET /reviews/:productId
 */
export const getAllReviews = async (req: Request, res: Response): Promise<Response> => {
  const { productId } = req.params;

  try {
    const reviewRepository = getRepository(ProductReview);

    // Fetch reviews
    const reviews = await reviewRepository.find({
      where: { productId },
      relations: ["customer", "product", "variation"],
    });

    logger.info(`Retrieved all reviews for product ID: ${productId}`);
    ResUtil.success({
      res,
      message: "Reviews retrieved successfully.",
      data: reviews,
    });
    return res;
  } catch (error) {
    logger.error(`Error retrieving reviews for product ID: ${productId} - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    ResUtil.badRequest({
      res,
      message: "Error retrieving reviews.",
      data: (error as Error).message,
    });
    return res;
  }
};

/**
 * Get average rating for a product
 * GET /reviews/:productId/average-rating
 */
export const getAverageRating = async (req: Request, res: Response): Promise<Response> => {
  const { productId } = req.params;

  try {
    const reviewRepository = getRepository(ProductReview);

    // Calculate average rating
    const reviews = await reviewRepository.find({
      where: { productId },
    });

    if (reviews.length === 0) {
      logger.warn(`No reviews found for product ID: ${productId}`);
      ResUtil.success({
        res,
        message: "No reviews found for this product.",
        data: { averageRating: 0 },
      });
      return res;
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rate, 0) / reviews.length;

    logger.info(`Average rating for product ID: ${productId} is ${averageRating}`);
    ResUtil.success({
      res,
      message: "Average rating retrieved successfully.",
      data: { averageRating },
    });
    return res;
  } catch (error) {
    logger.error(`Error retrieving average rating for product ID: ${productId} - ${(error as Error).message}`, {
      stack: (error as Error).stack,
    });
    ResUtil.badRequest({
      res,
      message: "Error retrieving average rating.",
      data: (error as Error).message,
    });
    return res;
  }
};