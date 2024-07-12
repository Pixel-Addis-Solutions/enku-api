import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { Category } from '../../entities/category';
import { categorySchema } from '../../util/validation/category-validation';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';

// Define repository using your custom getRepository function
const categoryRepository = getRepository(Category);

export const createCategory = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error } = categorySchema.validate(req.body);
    if (error) {
      logger.warn(`Validation failed for createCategory`, error.details);
      return ResUtil.unprocessable({ res, message: 'Validation failed', data: error.message });
    }

    // Create and save the category
    const category = categoryRepository.create(req.body);
    const savedCategory = await categoryRepository.save(category);
    logger.info(`Category created successfully: ${savedCategory.id}`);
    ResUtil.success({ res, message: 'Category created successfully', data: savedCategory });
  } catch (error: unknown) {
    logger.error(`Error creating category`, error);
    ResUtil.internalError({ res, message: 'Error creating category', data: error });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    // Retrieve the category
    const category = await categoryRepository.find();
    if (category) {
      logger.info(`Category retrieved successfully:`);
      ResUtil.success({ res, message: 'Category retrieved successfully', data: category });
    } else {
      logger.warn(`Categories not found:`);
      ResUtil.notFound({ res, message: 'Categories not found' });
    }
  } catch (error: unknown) {
    logger.error(`Error retrieving categories`, error);
    ResUtil.internalError({ res, message: 'Error retrieving categories', data: error });
  }
};
export const getCategory = async (req: Request, res: Response) => {
  try {
    // Retrieve the category
    const category = await categoryRepository.findOneBy({ id: req.params.id });
    if (category) {
      logger.info(`Category retrieved successfully: ${category.id}`);
      ResUtil.success({ res, message: 'Category retrieved successfully', data: category });
    } else {
      logger.warn(`Category not found: ${req.params.id}`);
      ResUtil.notFound({ res, message: 'Category not found' });
    }
  } catch (error: unknown) {
    logger.error(`Error retrieving category`, error);
    ResUtil.internalError({ res, message: 'Error retrieving category', data: error });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error } = categorySchema.validate(req.body);
    if (error) {
      logger.warn(`Validation failed for updateCategory`, error.details);
      return ResUtil.unprocessable({ res, message: 'Validation failed', data: error.message });
    }

    // Find and update the category
    const category = await categoryRepository.findOneBy({ id: req.params.id });
    if (category) {
      categoryRepository.merge(category, req.body);
      const updatedCategory = await categoryRepository.save(category);
      logger.info(`Category updated successfully: ${updatedCategory.id}`);
      ResUtil.success({ res, message: 'Category updated successfully', data: updatedCategory });
    } else {
      logger.warn(`Category not found for update: ${req.params.id}`);
      ResUtil.notFound({ res, message: 'Category not found' });
    }
  } catch (error: unknown) {
    logger.error(`Error updating category`, error);
    ResUtil.internalError({ res, message: 'Error updating category', data: error });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    // Delete the category
    const result = await categoryRepository.delete(req.params.id);
    if (result.affected) {
      logger.info(`Category deleted successfully: ${req.params.id}`);
      ResUtil.success({ res, message: 'Category deleted successfully' });
    } else {
      logger.warn(`Category not found for deletion: ${req.params.id}`);
      ResUtil.notFound({ res, message: 'Category not found' });
    }
  } catch (error: unknown) {
    logger.error(`Error deleting category`, error);
    ResUtil.internalError({ res, message: 'Error deleting category', data: error });
  }
};
