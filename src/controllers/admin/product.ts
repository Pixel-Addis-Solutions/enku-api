import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Product } from "../../entities/product";
import { productSchema } from "../../util/validation/product-validation";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { OptionValue } from "../../entities/option-value";
import { ProductImage } from "../../entities/product-image";
import { ProductVariation } from "../../entities/product-variation";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const productRepository = getRepository(Product);
    const products = await productRepository.find({
      relations: ["category", "brand", "variations"],
    });
    return ResUtil.success({
      res,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    logger.error("Error retrieving products", error);
    return ResUtil.internalError({
      res,
      message: "Error retrieving products",
      data: error,
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productRepository = getRepository(Product);
    const product = await productRepository.findOne({
      where: {id},
      relations: ["category", "brand", "variations"],
    });

    if (!product) {
      return ResUtil.notFound({ res, message: "Product not found" });
    }

    return ResUtil.success({
      res,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    logger.error("Error retrieving product by ID", error);
    return ResUtil.internalError({
      res,
      message: "Error retrieving product by ID",
      data: error,
    });
  }
};


export const createProduct = async (req: Request, res: Response) => {
  const productRepository = getRepository(Product);
  const optionRepository = getRepository(Option);
  const optionValueRepository = getRepository(OptionValue);
  const productImageRepository = getRepository(ProductImage);
  const productVariationRepository = getRepository(ProductVariation);

  try {
    const { name, description, price, images, variations } = req.body;

    const product = productRepository.create({ name, description, price });
    await productRepository.save(product);

    for (const imageUrl of images) {
      const image = productImageRepository.create({ url: imageUrl, product });
      await productImageRepository.save(image);
    }

    for (const variation of variations) {
      const { sku, quantity, images: variationImages, optionValues } = variation;

      const productVariation = productVariationRepository.create({ sku, quantity, product });
      await productVariationRepository.save(productVariation);

      for (const imageUrl of variationImages) {
        const image = productImageRepository.create({ url: imageUrl, variation: productVariation });
        await productImageRepository.save(image);
      }

      for (const optionValue of optionValues) {
        const { option: optionName, value } = optionValue;

        let option = await optionRepository.findOneBy({ name: optionName });
        if (!option) {
          option = optionRepository.create({ name: optionName });
          await optionRepository.save(option);
        }

        const optionValueEntity = optionValueRepository.create({ value, option, variation: productVariation });
        await optionValueRepository.save(optionValueEntity);
      }
    }

    return ResUtil.success({ res, message: 'Product created successfully', data: product });
  } catch (error) {
    logger.error(`Error creating product: ${error}`);
    return ResUtil.internalError({ res, message: 'Error creating product', data: error });
  }
};


export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = productSchema.validate(req.body);

    if (error) {
      return ResUtil.badRequest({
        res,
        message: "Validation error",
        data: error.details,
      });
    }

    const productRepository = getRepository(Product);
    const product = await productRepository.findOneBy({ id });

    if (!product) {
      return ResUtil.notFound({ res, message: "Product not found" });
    }

    productRepository.merge(product, req.body);
    await productRepository.save(product);

    logger.info(`Product updated successfully: ${product.id}`);
    return ResUtil.success({
      res,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    logger.error("Error updating product", error);
    return ResUtil.internalError({
      res,
      message: "Error updating product",
      data: error,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productRepository = getRepository(Product);
    const product = await productRepository.findOneBy({ id });

    if (!product) {
      return ResUtil.notFound({ res, message: "Product not found" });
    }

    await productRepository.remove(product);

    logger.info(`Product deleted successfully: ${id}`);
    return ResUtil.success({ res, message: "Product deleted successfully" });
  } catch (error) {
    logger.error("Error deleting product", error);
    return ResUtil.internalError({
      res,
      message: "Error deleting product",
      data: error,
    });
  }
};
