import { Request, Response } from "express";
import { getRepository, AppDataSource } from "../../data-source";
import { Product } from "../../entities/product";
import { productSchema } from "../../util/validation/product-validation";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { OptionValue } from "../../entities/option-value";
import { Option } from "../../entities/option";
import { ProductImage } from "../../entities/product-image";
import { ProductVariation } from "../../entities/product-variation";
import { QueryFailedError } from "typeorm";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const productRepository = getRepository(Product);
    const { page = 1, limit = 10 } = req.query;

    const [products, total] = await productRepository.findAndCount({
      relations: ["variations"],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        price: true,
      },
    });

    const productList = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      price: product.price,
      variationsCount: product.variations.length,
      rate: 4,
      reviewCount: 4333,
    }));

    return ResUtil.success({
      res,
      message: "Products fetched successfully",
      data: productList,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    logger.error(`Error fetching home page products: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching home page products",
      data: error,
    });
  }
};
export const getProductDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productRepository = getRepository(Product);

    const product = await productRepository.findOne({
      where: { id },
      relations: [
        "variations",
        "variations.optionValues",
        "variations.optionValues.option",
      ],
    });

    if (!product) {
      logger.warn(`Product not found with ID: ${id}`);
      return ResUtil.notFound({ res, message: "Product not found" });
    }

    return ResUtil.success({
      res,
      message: "Product details fetched successfully",
      data: product,
    });
  } catch (error) {
    logger.error(`Error fetching product details: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching product details",
      data: error,
    });
  }
};
export const getProductss = async (req: Request, res: Response) => {
  try {
    const productRepository = getRepository(Product);
    const products = await productRepository.find({
      relations: ["category", "brand", "variations.optionValues.option"],
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
      where: { id },
      relations: ["category", "brand", "variations.optionValue.option"],
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
  const entityManager = AppDataSource.createEntityManager();

  try {
    const {
      name,
      categoryId: category,
      subCategoryId: subCategory,
      subSubCategoryId: subSubCategory,
      brandId: brand,
      description,
      price,
      imageUrl,
      variations,
      ingredients,
      how_to_use,
      images,
      expiryDate,
      productionDate,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = req.body;
    await entityManager.transaction(async (transactionalEntityManager) => {
      const productRepository =
        transactionalEntityManager.getRepository(Product);
      const optionRepository = transactionalEntityManager.getRepository(Option);
      const optionValueRepository =
        transactionalEntityManager.getRepository(OptionValue);
      const productImageRepository =
        transactionalEntityManager.getRepository(ProductImage);
      const productVariationRepository =
        transactionalEntityManager.getRepository(ProductVariation);

      const product = productRepository.create({
        name,
        description,
        imageUrl,
        price,
        category,
        subCategory,
        subSubCategory,
        brand,
        ingredients,
        how_to_use,
        expiryDate,
        productionDate,
        metaTitle,
        metaDescription,
        metaKeywords,
      });
      await productRepository.save(product);

      for (const imageUrl of images) {
        const image = productImageRepository.create({ url: imageUrl, product });
        await productImageRepository.save(image);
      }

      for (const variation of variations) {
        const {
          sku,
          title,
          quantity,
          price,
          images: variationImages,
          optionValues,
          color
        } = variation;

        const productVariation = productVariationRepository.create({
          sku,
          title,
          quantity,
          price,
          product,
          color
        });
        await productVariationRepository.save(productVariation);

        for (const imageUrl of variationImages) {
          const image = productImageRepository.create({
            url: imageUrl,
            variation: productVariation,
          });
          await productImageRepository.save(image);
        }

        for (const optionValue of optionValues) {
          const { option: optionName, value } = optionValue;

          let option = await optionRepository.findOneBy({ name: optionName });
          if (!option) {
            option = optionRepository.create({ name: optionName });
            await optionRepository.save(option);
          }

          const optionValueEntity = optionValueRepository.create({
            value,
            option,
            variation: productVariation,
          });
          await optionValueRepository.save(optionValueEntity);
        }
      }
    });
    return ResUtil.success({
      res,
      message: "Product created successfully",
      data: null,
    });
  } catch (error) {
    if (error instanceof QueryFailedError) {
      const err = error as any;
      if (err.code === "23503" || err.errno === 1452) {
        // PostgreSQL: 23503, MySQL: 1452
        logger.error(`Foreign key constraint error: ${error.message}`);
        return ResUtil.badRequest({
          res,
          message: "Invalid foreign key reference",
        });
      }
    }
    logger.error(`Error creating product: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error creating product",
      data: error,
    });
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
