import { Request, Response } from "express";
import { getRepository } from "../../data-source";
import { Product } from "../../entities/product";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { stat } from "fs";

export const getProductDetailById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const productRepository = getRepository(Product);

    const product = await productRepository.findOne({
      where: { id: productId ,status: "active"},//Add product status 
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
      where: { category: { id: categoryId },status: "active" },//Add product status
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
      where: { subCategory: { id: subCategoryId } ,status: "active"},//Add Products Status
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
      where: { subSubCategory: { id: subSubCategoryId },status: "active" },//Add product status
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
    const {
      category,
      subCategory,
      subSubCategory,
      brand,
      filters,
      search,
      sortBy = "createdAt", // Default sorting by name
      sortOrder = "ASC", // Default ascending order
      page = 1, // Default to page 1
      limit = 10, // Default to 10 items per page
    } = req.query;

    const productRepository = getRepository(Product);

    const queryBuilder = productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.subCategory", "subCategory")
      .leftJoinAndSelect("product.subSubCategory", "subSubCategory")
      .leftJoinAndSelect("product.brand", "brand")
      .leftJoinAndSelect("product.filters", "productFilter")
      .leftJoinAndSelect(
        "product.variations",
        "variation",
        "variation.isFeatured = :isFeatured",
        { isFeatured: true }
      ) // Fetch the featured variation
      .leftJoinAndSelect("variation.images", "variationImages") // Include variation images if available
      .leftJoinAndSelect("product.images", "productImages") // Include product images if there are no variations

      .select([
        "product.id",
        "product.name",
        "product.description",
        "product.price",
        "product.imageUrl",
        "product.createdAt",
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
      ])
      .andWhere("product.status = :status", { status: "active" }); // Ensure only active products

    // Apply filters
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
      const valueIdsArray = (filters as string).split(",");
      queryBuilder.andWhere("productFilter.id IN (:...filterIds)", {
        filterIds: Array.isArray(valueIdsArray)
          ? valueIdsArray
          : [valueIdsArray],
      });
    }

    // Ensure all filter IDs are matched
    // if (filters) {
    //   const valueIdsArray = (filters as string).split(",");

    //   // Use subquery to ensure all filter IDs match for each product
    //   queryBuilder.andWhere((qb) => {
    //     const subQuery = qb
    //       .subQuery()
    //       .select("productFilter.productId")
    //       .from("productFilter", "productFilter")
    //       .where("productFilter.id IN (:...filterIds)", {
    //         filterIds: valueIdsArray,
    //       })
    //       .groupBy("productFilter.productId")
    //       .having("COUNT(productFilter.id) = :filterCount", {
    //         filterCount: valueIdsArray.length,
    //       })
    //       .getQuery();
    //     return `product.id IN (${subQuery})`;
    //   });
    // }

    // Apply search functionality
    if (search) {
      queryBuilder.andWhere(
        "product.name LIKE :search OR product.description LIKE :search",
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`product.${sortBy}`, sortOrder as "ASC" | "DESC");

    // Apply pagination
    queryBuilder.skip((Number(page) - 1) * Number(limit)).take(Number(limit));

    const products = await queryBuilder.getMany();

    return ResUtil.success({
      res,
      message: "Products fetched successfully",
      data: products,
      meta: {
        currentPage: Number(page),
        itemsPerPage: Number(limit),
      },
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
  const { keyword } = req.query;

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
        .orWhere("product.howToUse LIKE :keyword", {
          keyword: `%${keyword}%`,
        })
        .andWhere("product.status = :status", {
          status: "active",
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


export const getProductsWithFiltersAndDiscounts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      subCategory,
      subSubCategory,
      brand,
      filters,
      search,
      sortBy = "createdAt", // Default sorting by name
      sortOrder = "ASC", // Default ascending order
      page = 1, // Default to page 1
      limit = 10, // Default to 10 items per page
    } = req.query;

    const productRepository = getRepository(Product);

    const queryBuilder = productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.subCategory", "subCategory")
      .leftJoinAndSelect("product.subSubCategory", "subSubCategory")
      .leftJoinAndSelect("product.brand", "brand")
      .leftJoinAndSelect("product.filters", "productFilter")
      .leftJoinAndSelect("product.discounts", "productDiscount")
      .leftJoinAndSelect(
        "product.variations",
        "variation",
        "variation.isFeatured = :isFeatured",
        { isFeatured: true }
      ) // Fetch the featured variation
      .leftJoinAndSelect("variation.images", "variationImages") // Include variation images if available
      .leftJoinAndSelect("product.images", "productImages") // Include product images if there are no variations
      .where("productDiscount.status = :status", { status: true }) // Only include active discounts
      .select([
        "product.id",
        "product.name",
        "product.description",
        "product.price",
        "product.imageUrl",
        "product.createdAt",
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
        "productDiscount.id", // Include the discount ID
        "productDiscount.type", // Include the discount type
        "productDiscount.value", // Include the discount value
        "productDiscount.sta", // Include the discount start date
        "productDiscount.endDate", // Include the discount end date

        
      ]);

    // Apply filters
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
      const valueIdsArray = (filters as string).split(",");
      queryBuilder.andWhere("productFilter.id IN (:...filterIds)", {
        filterIds: Array.isArray(valueIdsArray)
          ? valueIdsArray
          : [valueIdsArray],
      });
    }


    // Apply search functionality
    if (search) {
      queryBuilder.andWhere(
        "product.name LIKE :search OR product.description LIKE :search",
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`product.${sortBy}`, sortOrder as "ASC" | "DESC");

    // Apply pagination
    queryBuilder.skip((Number(page) - 1) * Number(limit)).take(Number(limit));

    const products = await queryBuilder.getMany();

    return ResUtil.success({
      res,
      message: "Products fetched successfully",
      data: products,
      meta: {
        currentPage: Number(page),
        itemsPerPage: Number(limit),
      },
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