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
import { In, QueryFailedError } from "typeorm";
import { FilterValue } from "../../entities/filter";
import { Category } from "../../entities/category";
import { SubCategory } from "../../entities/sub-category";
import { SubSubCategory } from "../../entities/sub-sub-category";
import { Brand } from "../../entities/brand";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const productRepository = getRepository(Product);
    const {
      page = 1,
      limit = 10,
      categoryId,
      subCategoryId,
      subSubCategoryId,
      search,
    } = req.query;

    const query = productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.variations", "variations")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.subCategory", "subCategory")
      .leftJoinAndSelect("product.subSubCategory", "subSubCategory")
      .leftJoinAndSelect("product.filters", "filters")
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit));

    // Filter by categoryId
    if (categoryId) {
      query.andWhere("category.id = :categoryId", { categoryId });
    }

    // Filter by subCategoryId
    if (subCategoryId) {
      query.andWhere("subCategory.id = :subCategoryId", { subCategoryId });
    }

    // Filter by subSubCategoryId
    if (subSubCategoryId) {
      query.andWhere("subSubCategory.id = :subSubCategoryId", {
        subSubCategoryId,
      });
    }

    // Filter by search term
    if (search) {
      query.andWhere(
        "product.name LIKE :search OR product.description LIKE :search",
        { search: `%${search}%` }
      );
    }

    const [products, total] = await query.getManyAndCount();

    const productList = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      imageUrl: product.imageUrl,
      category: { id: product?.category?.id, name: product?.category?.name },
      variationsCount: product.variations.length,
      rate: 0, // Assuming this is hard-coded for now
      reviewCount: 0, // Assuming this is hard-coded for now
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
    logger.error(`Error fetching products: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching products",
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
        "images",
        "category",
        "brand",
        "subCategory",
        "subSubCategory",
        "variations",
        "variations.images",
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

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productRepository = getRepository(Product);
    const product = await productRepository.findOne({
      where: { id },
      relations: [
        "category",
        "brand",
        "variations.optionValue.option",
        "variations.images",
      ],
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
      howToUse,
      images,
      expiryDate,
      productionDate,
      metaTitle,
      metaDescription,
      metaKeywords,
      origin,
      certified,
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
        howToUse,
        origin,
        expiryDate,
        productionDate,
        metaTitle,
        metaDescription,
        metaKeywords,
        certified,
      });
      await productRepository.save(product);

      for (const imageUrl of images) {
        const image = productImageRepository.create({ url: imageUrl, product });
        await productImageRepository.save(image);
      }

      if (variations?.length) {
        for (const variation of variations) {
          const {
            sku,
            title,
            quantity,
            price,
            images: variationImages,
            optionValues,
            color,
            isFeatured,
          } = variation;

          const productVariation = productVariationRepository.create({
            sku,
            title,
            quantity,
            price,
            product,
            color,
            isFeatured,
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
  const { id } = req.params;
  const {
    name,
    description,
    imageUrl,
    price,
    categoryId,
    subCategoryId,
    subSubCategoryId,
    brandId,
    ingredients,
    howToUse,
    origin,
    expiryDate,
    productionDate,
    metaTitle,
    metaDescription,
    metaKeywords,
    certified,
    images,
    color,
    status
  } = req.body;

  const productRepository = getRepository(Product);
  const categoryRepository = getRepository(Category);
  const subCategoryRepository = getRepository(SubCategory);
  const subSubCategoryRepository = getRepository(SubSubCategory);
  const brandRepository = getRepository(Brand);
  const imageRepository = getRepository(ProductImage); // Repository for handling images

  try {
    // Validate input
    // const { error } = productSchema.validate(req.body);
    // if (error) {
    //   return ResUtil.badRequest({
    //     res,
    //     message: "Validation error",
    //     data: error.details,
    //   });
    // }

    // Fetch the product to update
    const product = await productRepository.findOne({
      where: { id },
      relations: [
        "category",
        "subCategory",
        "subSubCategory",
        "brand",
        "images",
      ],
    });

    if (!product) {
      return ResUtil.notFound({ res, message: "Product not found" });
    }

    // Update simple fields
    product.name = name;
    product.description = description;
    product.price = price;
    product.imageUrl = imageUrl;
    product.ingredients = ingredients;
    product.howToUse = howToUse;
    product.origin = origin;
    product.expiryDate = expiryDate;
    product.productionDate = productionDate;
    product.metaTitle = metaTitle;
    product.metaDescription = metaDescription;
    product.metaKeywords = metaKeywords;
    product.certified = certified;
    product.color = color;
    product.status = status;

    // Handle foreign keys (category, subCategory, subSubCategory, brand)
    if (categoryId) {
      const category = await categoryRepository.findOneBy({ id: categoryId });
      if (!category) {
        return ResUtil.badRequest({ res, message: "Invalid categoryId" });
      }
      product.category = category;
    }

    if (subCategoryId) {
      const subCategory = await subCategoryRepository.findOneBy({
        id: subCategoryId,
      });
      if (!subCategory) {
        return ResUtil.badRequest({ res, message: "Invalid subCategoryId" });
      }
      product.subCategory = subCategory;
    }

    if (subSubCategoryId) {
      const subSubCategory = await subSubCategoryRepository.findOneBy({
        id: subSubCategoryId,
      });
      if (!subSubCategory) {
        return ResUtil.badRequest({ res, message: "Invalid subSubCategoryId" });
      }
      product.subSubCategory = subSubCategory;
    }

    if (brandId) {
      const brand = await brandRepository.findOneBy({ id: brandId });
      if (!brand) {
        return ResUtil.badRequest({ res, message: "Invalid brandId" });
      }
      product.brand = brand;
    }

    if (images && images.length > 0) {
      for (const imageUrl of images) {
        const image = imageRepository.create({ url: imageUrl, product });
        await imageRepository.save(image);
        product.images.push(image); // Append new images to the existing ones
      }
    }

    // Save the updated product
    await productRepository.save(product);

    logger.info(`Product updated successfully: ${product.id}`);
    return ResUtil.success({
      res,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
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
    
    // Find the product with all its relations
    const product = await productRepository.findOne({
      where: { id },
      relations: [
        'variations',
        'variations.images',
        'variations.optionValues',
        'images',
        'filters'
      ]
    });

    if (!product) {
      return ResUtil.notFound({ res, message: "Product not found" });
    }

    // Delete the product which will cascade delete related entities
    await productRepository.remove(product);

    logger.info(`Product deleted successfully with ID: ${id}`);
    return ResUtil.success({ 
      res, 
      message: "Product and all related data deleted successfully" 
    });
  } catch (error) {
    logger.error("Error deleting product", error);
    return ResUtil.internalError({
      res,
      message: "Error deleting product",
      data: error,
    });
  }
};

// Assign filter values to products
export const assignFilterValuesToProduct = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId, filterValueIds } = req.body;
    const productRepository = getRepository(Product);
    const filterValueRepository = getRepository(FilterValue);

    const product = await productRepository.findOne({
      where: { id: productId },
      relations: ["filters"],
    });
    if (!product) {
      return ResUtil.notFound({ res, message: "Product not found" });
    }

    const filterValues = await filterValueRepository.find({
      where: { id: In(filterValueIds) },
    });

    product.filters = filterValues;
    await productRepository.save(product);

    return ResUtil.success({
      res,
      message: "Filter values assigned to product successfully",
    });
  } catch (error) {
    logger.error(`Error assigning filter values to products: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error assigning filter values to products",
      data: error,
    });
  }
};

export const deleteProductImage = async (req: Request, res: Response) => {
  const { id } = req.params;

  const imageRepository = getRepository(ProductImage);

  try {
    // Fetch the image to delete
    const image = await imageRepository.findOne({
      where: { id: id },
    });

    if (!image) {
      return ResUtil.notFound({ res, message: "Image not found" });
    }

    // Delete the image
    await imageRepository.remove(image);

    logger.info(`Product or variation image deleted successfully: ${id}`);
    return ResUtil.success({
      res,
      message: "Product or variation image deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error deleting product or variation image", error);
    return ResUtil.internalError({
      res,
      message: "Error deleting product or variation image",
      data: error,
    });
  }
};
