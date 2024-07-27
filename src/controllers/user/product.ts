import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { Product } from '../../entities/product';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';

export const getProductDetailById = async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const productRepository = getRepository(Product);
  
      const product = await productRepository.findOne({
        where: { id: productId },
        relations: ['variations.images', 'variations.optionValues', 'variations.optionValues.option', 'images'],
      });
  
      if (!product) {
        logger.warn(`Product not found with ID: ${productId}`);
        return ResUtil.notFound({ res, message: 'Product not found' });
      }
  
      return ResUtil.success({
        res,
        message: 'Product detail fetched successfully',
        data: product,
      });
    } catch (error) {
      logger.error(`Error fetching product detail by ID: ${error}`);
      return ResUtil.internalError({ res, message: 'Error fetching product detail', data: error });
    }
  };
  

export const getProductsByCategoryId = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const productRepository = getRepository(Product);

    const products = await productRepository.find({
      where: { category: { id: categoryId } },
      select: ['id', 'name', 'description', 'price', 'imageUrl'],
    });

    return ResUtil.success({
      res,
      message: 'Products fetched successfully',
      data: products,
    });
  } catch (error) {
    logger.error(`Error fetching products by category ID: ${error}`);
    return ResUtil.internalError({ res, message: 'Error fetching products', data: error });
  }
};

export const getProductsBySubCategoryId = async (req: Request, res: Response) => {
    try {
      const { subCategoryId } = req.params;
      const productRepository = getRepository(Product);
  
      const products = await productRepository.find({
        where: { subCategory: { id: subCategoryId } },
        select: ['id', 'name', 'description', 'price', 'imageUrl'],
      });
  
      return ResUtil.success({
        res,
        message: 'Products fetched successfully',
        data: products,
      });
    } catch (error) {
      logger.error(`Error fetching products by subcategory ID: ${error}`);
      return ResUtil.internalError({ res, message: 'Error fetching products', data: error });
    }
  };
  
export const getProductsBySubSubCategoryId = async (req: Request, res: Response) => {
    try {
      const { subSubCategoryId } = req.params;
      const productRepository = getRepository(Product);
  
      const products = await productRepository.find({
        where: { subSubCategory: { id: subSubCategoryId } },
        select: ['id', 'name', 'description', 'price', 'imageUrl'],
      });
  
      return ResUtil.success({
        res,
        message: 'Products fetched successfully',
        data: products,
      });
    } catch (error) {
      logger.error(`Error fetching products by sub-subcategory ID: ${error}`);
      return ResUtil.internalError({ res, message: 'Error fetching products', data: error });
    }
  };
  

export const getProductsWithFilters = async (req: Request, res: Response) => {
  try {
    const { category, subCategory, subSubCategory, brand } = req.query;
    const productRepository = getRepository(Product);

    const queryBuilder = productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .leftJoinAndSelect('product.subSubCategory', 'subSubCategory')
      .leftJoinAndSelect('product.brand', 'brand')
      .select([
        'product.id',
        'product.name',
        'product.description',
        'product.price',
        'product.imageUrl',
        'category.name',
        'subCategory.name',
        'subSubCategory.name',
        'brand.name',
      ]);

    if (category) {
      queryBuilder.andWhere('category.name IN (:...categories)', { categories: Array.isArray(category) ? category : [category] });
    }
    if (subCategory) {
      queryBuilder.andWhere('subCategory.name IN (:...subCategories)', { subCategories: Array.isArray(subCategory) ? subCategory : [subCategory] });
    }
    if (subSubCategory) {
      queryBuilder.andWhere('subSubCategory.name IN (:...subSubCategories)', { subSubCategories: Array.isArray(subSubCategory) ? subSubCategory : [subSubCategory] });
    }
    if (brand) {
      queryBuilder.andWhere('brand.name IN (:...brands)', { brands: Array.isArray(brand) ? brand : [brand] });
    }

    const products = await queryBuilder.getMany();

    return ResUtil.success({
      res,
      message: 'Products fetched successfully',
      data: products,
    });
  } catch (error) {
    logger.error(`Error fetching products with filters: ${error}`);
    return ResUtil.internalError({ res, message: 'Error fetching products', data: error });
  }
};
