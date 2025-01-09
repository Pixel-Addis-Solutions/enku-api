import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { ProductVariation } from '../../entities/product-variation';
import { ProductImage } from '../../entities/product-image';
import { Favorite } from '../../entities/favorite'; 
import { ResUtil } from '../../helper/response.helper';
import logger from "../../util/logger";
import { unlinkFile } from '../../helper/file.helper'; // Assuming you have a file unlink helper

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
        // const { error } = variationSchema.validate(req.body);
        // if (error) {
        //     return ResUtil.badRequest({
        //         res,
        //         message: "Validation error",
        //         data: error.details,
        //     });
        // }

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

export const deleteProductVariations = async (req: Request, res: Response) => {
    const { productId } = req.params;

    const variationRepository = getRepository(ProductVariation);
    const imageRepository = getRepository(ProductImage);
    const favoriteRepository = getRepository(Favorite); // Ensure this repository is retrieved

    try {
        // Fetch the variations to delete
        const variations = await variationRepository.find({
            where: { product: { id: productId } },
            relations: ["images"],
        });

        if (!variations || variations.length === 0) {
            return ResUtil.notFound({ res, message: "No product variations found for the given product ID" });
        }

        // Delete the images associated with each variation
        for (const variation of variations) {
            // Delete favorites associated with the variation
            await favoriteRepository.delete({ variation });

            for (const image of variation.images) {
                // Remove the image file from the file system
                await unlinkFile(image.url);
                // Remove the image record from the database
                await imageRepository.remove(image);
            }
            // Remove the variation record from the database
            await variationRepository.remove(variation);
        }

        logger.info(`Product variations and images deleted successfully for product ID: ${productId}`);
        return ResUtil.success({
            res,
            message: "Product variations and images deleted successfully",
        });
    } catch (error: any) {
        logger.error("Error deleting product variations", error);
        return ResUtil.internalError({
            res,
            message: "Error deleting product variations",
            data: error,
        });
    }
};