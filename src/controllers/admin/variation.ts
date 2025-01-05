import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { ProductVariation } from '../../entities/product-variation';
import { Product } from '../../entities/product';
import {ProductImage} from '../../entities/product-image';
import { ResUtil } from '../../helper/response.helper';
import logger from "../../util/logger";




// export const createProductVariation = async (req: Request, res: Response) => {
//   const {
//     productId, // The product ID to which this variation belongs
//     sku,
//     title,
//     price,
//     isFeatured,
//     quantity,
//     images, // Expecting an array of image URLs
//   } = req.body;

//   const variationRepository = getRepository(ProductVariation);
//   const productRepository = getRepository(Product);
//   const imageRepository = getRepository(ProductImage);

//   try {
//     // Fetch the product to associate with the variation
//     const product = await productRepository.findOne({
//       where: { id: productId },
//     });

//     if (!product) {
//       return ResUtil.notFound({ res, message: "Product not found" });
//     }

//     // Create the new product variation
//     const newVariation = variationRepository.create({
//       sku,
//       title,
//       price,
//       isFeatured,
//       quantity,
//       product,
//     });

//     // Save the new product variation
//     await variationRepository.save(newVariation);

//     // Add images if provided
//     if (images && images.length > 0) {
//       for (const imageUrl of images) {
//         const image = imageRepository.create({ url: imageUrl, variation: newVariation });
//         await imageRepository.save(image);
//         newVariation.images = newVariation.images || [];
//         newVariation.images.push(image); // Append new images to the variation
//       }
//     }

//     // Save the variation again to include the images
//     await variationRepository.save(newVariation);

//     logger.info(`Product variation created successfully: ${newVariation.id}`);
//     return ResUtil.success({
//       res,
//       message: "Product variation created successfully",
//       data: newVariation,
//     });
//   } catch (error: any) {
//     logger.error("Error creating product variation", error);
//     return ResUtil.internalError({
//       res,
//       message: "Error creating product variation",
//       data: error,
//     });
//   }
// };

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