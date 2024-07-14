// src/controllers/sub-sub-category.controller.ts
import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { SubSubCategory } from '../../entities/sub-sub-category';
import { Category } from '../../entities/category';
import { SubCategory } from '../../entities/sub-category';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';

import { createSubSubCategorySchema, updateSubSubCategorySchema } from '../../util/validation/sub-sub-category-validation';

export const createSubSubCategory = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error } = createSubSubCategorySchema.validate(req.body);
    if (error) {
      return ResUtil.badRequest({ res, message: error.details[0].message });
    }

    const { name, categoryId, subCategoryId } = req.body;

    const categoryRepository = getRepository(Category);
    const subCategoryRepository = getRepository(SubCategory);
    const subSubCategoryRepository = getRepository(SubSubCategory);

    const category = await categoryRepository.findOneBy({ id: categoryId });
    if (!category) {
      return ResUtil.badRequest({ res, message: 'Category not found' });
    }

    const subCategory = await subCategoryRepository.findOneBy({ id: subCategoryId });
    if (!subCategory) {
      return ResUtil.badRequest({ res, message: 'Sub-category not found' });
    }

    const subSubCategory = subSubCategoryRepository.create({ name, category, subCategory });
    await subSubCategoryRepository.save(subSubCategory);

    return ResUtil.success({ res, message: 'Sub-sub-category created successfully', data: subSubCategory });
  } catch (error) {
    logger.error(`Error creating sub-sub-category: ${error}`);
    return ResUtil.internalError({ res, message: 'Error creating sub-sub-category', data: error });
  }
};

export const getSubSubCategories = async (req: Request, res: Response) => {
  try {
    const subSubCategoryRepository = getRepository(SubSubCategory);
    const subSubCategories = await subSubCategoryRepository.find({ relations: ['category', 'subCategory'] });

    return ResUtil.success({ res, message: 'Sub-sub-categories fetched successfully', data: subSubCategories });
  } catch (error) {
    logger.error(`Error fetching sub-sub-categories: ${error}`);
    return ResUtil.internalError({ res, message: 'Error fetching sub-sub-categories', data: error });
  }
};

export const getSubSubCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subSubCategoryRepository = getRepository(SubSubCategory);
    const subSubCategory = await subSubCategoryRepository.findOne({ where: { id }, relations: ['category', 'subCategory'] });

    if (!subSubCategory) {
      return ResUtil.notFound({ res, message: 'Sub-sub-category not found' });
    }

    return ResUtil.success({ res, message: 'Sub-sub-category fetched successfully', data: subSubCategory });
  } catch (error) {
    logger.error(`Error fetching sub-sub-category: ${error}`);
    return ResUtil.internalError({ res, message: 'Error fetching sub-sub-category', data: error });
  }
};

export const updateSubSubCategory = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { error } = updateSubSubCategorySchema.validate(req.body);
    if (error) {
      return ResUtil.badRequest({ res, message: error.details[0].message });
    }

    const { id } = req.params;
    const { name, categoryId, subCategoryId } = req.body;

    const categoryRepository = getRepository(Category);
    const subCategoryRepository = getRepository(SubCategory);
    const subSubCategoryRepository = getRepository(SubSubCategory);

    let subSubCategory = await subSubCategoryRepository.findOne({ where: { id } });
    if (!subSubCategory) {
      return ResUtil.notFound({ res, message: 'Sub-sub-category not found' });
    }

    const category = await categoryRepository.findOneBy({ id: categoryId });
    if (!category) {
      return ResUtil.badRequest({ res, message: 'Category not found' });
    }

    const subCategory = await subCategoryRepository.findOneBy({ id: subCategoryId });
    if (!subCategory) {
      return ResUtil.badRequest({ res, message: 'Sub-category not found' });
    }

    subSubCategory.name = name;
    subSubCategory.category = category;
    subSubCategory.subCategory = subCategory;
    await subSubCategoryRepository.save(subSubCategory);

    return ResUtil.success({ res, message: 'Sub-sub-category updated successfully', data: subSubCategory });
  } catch (error) {
    logger.error(`Error updating sub-sub-category: ${error}`);
    return ResUtil.internalError({ res, message: 'Error updating sub-sub-category', data: error });
  }
};

export const deleteSubSubCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subSubCategoryRepository = getRepository(SubSubCategory);
    const subSubCategory = await subSubCategoryRepository.findOne({ where: { id } });

    if (!subSubCategory) {
      return ResUtil.notFound({ res, message: 'Sub-sub-category not found' });
    }

    await subSubCategoryRepository.remove(subSubCategory);

    return ResUtil.success({ res, message: 'Sub-sub-category deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting sub-sub-category: ${error}`);
    return ResUtil.internalError({ res, message: 'Error deleting sub-sub-category', data: error });
  }
};

