import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Product } from "../../entities/product";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";

export const getProductDetailById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const productRepository = getRepository(Product);

    const product = await productRepository.findOne({
      where: { id: productId },
      relations: [
        "variations.images",
        "variations.optionValues",
        "variations.optionValues.option",
        "images",
      ],
    });

    if (!product) {
      logger.warn(`Product not found with ID: ${productId}`);
      return ResUtil.notFound({ res, message: "Product not found" });
    }

    return ResUtil.success({
      res,
      message: "Product detail fetched successfully",
      data: product,
    });
  } catch (error) {
    logger.error(`Error fetching product detail by ID: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching product detail",
      data: error,
    });
  }
};

export const getProductsByCategoryId = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const productRepository = getRepository(Product);

    const products = await productRepository.find({
      where: { category: { id: categoryId } },
      select: ["id", "name", "description", "price", "imageUrl"],
    });

    return ResUtil.success({
      res,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    logger.error(`Error fetching products by category ID: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching products",
      data: error,
    });
  }
};

export const getProductsBySubCategoryId = async (
  req: Request,
  res: Response
) => {
  try {
    const { subCategoryId } = req.params;
    const productRepository = getRepository(Product);

    const products = await productRepository.find({
      where: { subCategory: { id: subCategoryId } },
      select: ["id", "name", "description", "price", "imageUrl"],
    });

    return ResUtil.success({
      res,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    logger.error(`Error fetching products by subcategory ID: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching products",
      data: error,
    });
  }
};

export const getProductsBySubSubCategoryId = async (
  req: Request,
  res: Response
) => {
  try {
    const { subSubCategoryId } = req.params;
    const productRepository = getRepository(Product);

    const products = await productRepository.find({
      where: { subSubCategory: { id: subSubCategoryId } },
      select: ["id", "name", "description", "price", "imageUrl"],
    });

    return ResUtil.success({
      res,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    logger.error(`Error fetching products by sub-subcategory ID: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching products",
      data: error,
    });
  }
};

export const getProductsWithFilters = async (req: Request, res: Response) => {
  try {
    const { category, subCategory, subSubCategory, brand, filters } = req.query;
    const productRepository = getRepository(Product);

    const queryBuilder = productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.subCategory", "subCategory")
      .leftJoinAndSelect("product.subSubCategory", "subSubCategory")
      .leftJoinAndSelect("product.brand", "brand")
      .leftJoinAndSelect("product.filters", "productFilter")
      // .leftJoinAndSelect("productFilter.filter", "filterValue")
      .leftJoinAndSelect(
        "product.variations",
        "variation",
        "variation.isFeatured = :isFeatured",
        { isFeatured: false }
      ) // Fetch the featured variation
      .leftJoinAndSelect("variation.images", "variationImages") // Include variation images if available
      .leftJoinAndSelect("product.images", "productImages") // Include product images if there are no variations

      .select([
        "product.id",
        "product.name",
        "product.description",
        "product.price",
        "product.imageUrl",
        "category.name",
        "subCategory.name",
        "subSubCategory.name",
        "brand.name",
        "productFilter.id",
        "productFilter.value",
        "variation.id", // Include the variation ID
        "variation.title", // Include the variation name
        "variation.price", // Include the variation price
        "variation.isFeatured", // Include the isFeatured flag
        "variationImages.id", // Include the image id for the variation
        "variationImages.url", // Include the image URLs for the variation
        "productImages.id", // Include the image id for the product itself
        "productImages.url", // Include the image URLs for the product itself
      ]);

    if (category) {
      queryBuilder.andWhere("category.name IN (:...categories)", {
        categories: Array.isArray(category) ? category : [category],
      });
    }
    if (subCategory) {
      queryBuilder.andWhere("subCategory.name IN (:...subCategories)", {
        subCategories: Array.isArray(subCategory) ? subCategory : [subCategory],
      });
    }
    if (subSubCategory) {
      queryBuilder.andWhere("subSubCategory.name IN (:...subSubCategories)", {
        subSubCategories: Array.isArray(subSubCategory)
          ? subSubCategory
          : [subSubCategory],
      });
    }
    if (brand) {
      queryBuilder.andWhere("brand.name IN (:...brands)", {
        brands: Array.isArray(brand) ? brand : [brand],
      });
    }
    if (filters) {
      const valueIdsArray = (filters as string).split(',') ;

      console.log("filters", valueIdsArray[0]);

      queryBuilder.andWhere("productFilter.id IN (:...filterIds)", {
        filterIds: Array.isArray(valueIdsArray) ? valueIdsArray : [valueIdsArray],
      });
    }

    const products = await queryBuilder.getMany();

    return ResUtil.success({
      res,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    logger.error(`Error fetching products with filters: ${error}`);
    return ResUtil.internalError({
      res,
      message: "Error fetching products",
      data: error,
    });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  const {
    keyword,
    category,
    subCategory,
    brand,
    minPrice,
    maxPrice,
    discountRange,
    optionIds,
    valueIds,
    rating,
  } = req.query;

  try {
    const productRepository = getRepository(Product);

    let query = productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.subCategory", "subCategory")
      .leftJoinAndSelect("product.brand", "brand")
      .leftJoinAndSelect("product.variations", "variations")
      .leftJoinAndSelect("variations.optionValues", "optionValues")
      .leftJoinAndSelect("optionValues.option", "option")
      .leftJoinAndSelect("product.images", "images");

    if (keyword) {
      query = query
        .where("product.name LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("product.description LIKE :keyword", {
          keyword: `%${keyword}%`,
        })
        .orWhere("product.ingredients LIKE :keyword", {
          keyword: `%${keyword}%`,
        })
        .orWhere("product.how_to_use LIKE :keyword", {
          keyword: `%${keyword}%`,
        });
    }

    // if (category) {
    //   query = query.andWhere('category.id IN (:...category)', { category: category.split(',') });
    // }

    // if (subCategory) {
    //   query = query.andWhere('subCategory.id IN (:...subCategory)', { subCategory: subCategory.split(',') });
    // }

    // if (brand) {
    //   query = query.andWhere('brand.id IN (:...brand)', { brand: brand.split(',') });
    // }

    // if (minPrice) {
    //   query = query.andWhere('product.price >= :minPrice', { minPrice });
    // }

    // if (maxPrice) {
    //   query = query.andWhere('product.price <= :maxPrice', { maxPrice });
    // }

    // if (discountRange) {
    //   const [minDiscount, maxDiscount] = discountRange.split('-').map(Number);
    //   query = query.andWhere('product.discount >= :minDiscount', { minDiscount })
    //                .andWhere('product.discount <= :maxDiscount', { maxDiscount });
    // }

    // if (optionIds) {
    //   const optionIdsArray = optionIds?.split(',');
    //   query = query.andWhere('option.id IN (:...optionIds)', { optionIds: optionIdsArray });
    // }

    // if (valueIds) {
    //   const valueIdsArray = valueIds.split(',');
    //   query = query.andWhere('optionValues.id IN (:...valueIds)', { valueIds: valueIdsArray });
    // }

    if (rating) {
      query = query.andWhere("product.rating >= :rating", {
        rating: parseFloat(rating as string),
      });
    }

    const products = await query.getMany();

    return ResUtil.success({
      res,
      message: "Products fetched successfully",
      data: { products },
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
