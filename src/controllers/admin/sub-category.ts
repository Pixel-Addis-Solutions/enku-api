import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { SubCategory } from '../../entities/sub-category';
import { subCategorySchema } from '../../util/validation/sub-category-validation';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger'; // Adjust the import path according to your project structure

// Create a new subcategory
export const createSubCategory = async (req: Request, res: Response) => {
  try {
    const { error } = subCategorySchema.validate(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.message}`);
      return ResUtil.badRequest({ res, message: error.message });
    }

    const subCategoryRepository = getRepository(SubCategory);
    const subCategory = subCategoryRepository.create(req.body);
    const savedSubCategory = await subCategoryRepository.save(subCategory);

    logger.info(`SubCategory created successfully: ${savedSubCategory.id}`);
    return ResUtil.success({ res, message: 'SubCategory created successfully', data: savedSubCategory });
  } catch (error) {
    logger.error('Error creating subcategory', error);
    return ResUtil.internalError({ res, message: 'Error creating subcategory', data: error });
  }
};

// Get all subcategories
export const getSubCategories = async (req: Request, res: Response) => {
  try {
    const subCategoryRepository = getRepository(SubCategory);
    const subCategories = await subCategoryRepository.find();

    logger.info('SubCategories retrieved successfully');
    return ResUtil.success({ res, message: 'SubCategories retrieved successfully', data: subCategories });
  } catch (error) {
    logger.error('Error retrieving subcategories', error);
    return ResUtil.internalError({ res, message: 'Error retrieving subcategories', data: error });
  }
};

// Get a single subcategory by ID
export const getSubCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subCategoryRepository = getRepository(SubCategory);
    const subCategory = await subCategoryRepository.findOneBy({ id });

    if (!subCategory) {
      logger.warn(`SubCategory not found with ID: ${id}`);
      return ResUtil.notFound({ res, message: 'SubCategory not found' });
    }

    logger.info(`SubCategory retrieved successfully: ${id}`);
    return ResUtil.success({ res, message: 'SubCategory retrieved successfully', data: subCategory });
  } catch (error) {
    logger.error('Error retrieving subcategory by ID', error);
    return ResUtil.internalError({ res, message: 'Error retrieving subcategory by ID', data: error });
  }
};

// Update a subcategory by ID
export const updateSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = subCategorySchema.validate(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.message}`);
      return ResUtil.badRequest({ res, message: error.message });
    }

    const subCategoryRepository = getRepository(SubCategory);
    const subCategory = await subCategoryRepository.findOneBy({ id });

    if (!subCategory) {
      logger.warn(`SubCategory not found with ID: ${id}`);
      return ResUtil.notFound({ res, message: 'SubCategory not found' });
    }

    subCategoryRepository.merge(subCategory, req.body);
    const updatedSubCategory = await subCategoryRepository.save(subCategory);

    logger.info(`SubCategory updated successfully: ${id}`);
    return ResUtil.success({ res, message: 'SubCategory updated successfully', data: updatedSubCategory });
  } catch (error) {
    logger.error('Error updating subcategory', error);
    return ResUtil.internalError({ res, message: 'Error updating subcategory', data: error });
  }
};

// Delete a subcategory by ID
export const deleteSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subCategoryRepository = getRepository(SubCategory);
    const subCategory = await subCategoryRepository.findOneBy({ id });

    if (!subCategory) {
      logger.warn(`SubCategory not found with ID: ${id}`);
      return ResUtil.notFound({ res, message: 'SubCategory not found' });
    }

    await subCategoryRepository.remove(subCategory);

    logger.info(`SubCategory deleted successfully: ${id}`);
    return ResUtil.noContent({ res, message: 'SubCategory deleted successfully' });
  } catch (error) {
    logger.error('Error deleting subcategory', error);
    return ResUtil.internalError({ res, message: 'Error deleting subcategory', data: error });
  }
};
