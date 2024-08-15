import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { ProductVariation } from '../../entities/product-variation';
import { Product } from '../../entities/product';
import {ProductImage} from '../../entities/product-image';
import { ResUtil } from '../../helper/response.helper';
import logger from "../../util/logger";

export const updateProductVariation = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      title,
      price,
      isFeatured,
      quantity,
      images, // Expecting an array of image URLs
    } = req.body;
  
    const variationRepository = getRepository(ProductVariation);
    const imageRepository = getRepository(ProductImage);
  
    try {
      // Validate input
    //   const { error } = variationSchema.validate(req.body);
    //   if (error) {
    //     return ResUtil.badRequest({
    //       res,
    //       message: "Validation error",
    //       data: error.details,
    //     });
    //   }
  
      // Fetch the variation to update
      const variation = await variationRepository.findOne({
        where: { id: id },
        relations: ["images"],
      });
  
      if (!variation) {
        return ResUtil.notFound({ res, message: "Product variation not found" });
      }
  
      // Update the variation fields
      variation.title = title;
      variation.price = price;
      variation.isFeatured = isFeatured;
      variation.quantity = quantity;
  
      // Add new images if provided
      if (images && images.length > 0) {
        for (const imageUrl of images) {
          const image = imageRepository.create({ url: imageUrl, variation });
          await imageRepository.save(image);
          variation.images.push(image); // Append new images to the existing ones
        }
      }
  
      // Save the updated variation
      await variationRepository.save(variation);
  
      logger.info(`Product variation updated successfully: ${variation.id}`);
      return ResUtil.success({
        res,
        message: "Product variation updated successfully",
        data: variation,
      });
    } catch (error: any) {
      logger.error("Error updating product variation", error);
      return ResUtil.internalError({
        res,
        message: "Error updating product variation",
        data: error,
      });
    }
  };
