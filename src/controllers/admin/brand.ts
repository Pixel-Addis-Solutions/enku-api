import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { Brand } from '../../entities/brand';
import { brandSchema } from '../../util/validation/brand-validation';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';

// Create a new brand
export const createBrand = async (req: Request, res: Response) => {
  try {
    const { error } = brandSchema.validate(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.message}`);
      return ResUtil.badRequest({ res, message: error.message });
    }

    const brandRepository = getRepository(Brand);
    const brand = brandRepository.create(req.body);
    const savedBrand = await brandRepository.save(brand);

    logger.info(`Brand created successfully: ${savedBrand.id}`);
    return ResUtil.success({ res, message: 'Brand created successfully', data: savedBrand });
  } catch (error) {
    logger.error('Error creating brand', error);
    return ResUtil.internalError({ res, message: 'Error creating brand', data: error });
  }
};

// Get all brands
export const getBrands = async (req: Request, res: Response) => {
  try {
    const brandRepository = getRepository(Brand);
    const brands = await brandRepository.find();

    logger.info('Brands retrieved successfully');
    return ResUtil.success({ res, message: 'Brands retrieved successfully', data: brands });
  } catch (error) {
    logger.error('Error retrieving brands', error);
    return ResUtil.internalError({ res, message: 'Error retrieving brands', data: error });
  }
};

// Get a single brand by ID
export const getBrandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const brandRepository = getRepository(Brand);
    const brand = await brandRepository.findOneBy({ id });

    if (!brand) {
      logger.warn(`Brand not found with ID: ${id}`);
      return ResUtil.notFound({ res, message: 'Brand not found' });
    }

    logger.info(`Brand retrieved successfully: ${id}`);
    return ResUtil.success({ res, message: 'Brand retrieved successfully', data: brand });
  } catch (error) {
    logger.error('Error retrieving brand by ID', error);
    return ResUtil.internalError({ res, message: 'Error retrieving brand by ID', data: error });
  }
};

// Update a brand by ID
export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = brandSchema.validate(req.body);
    if (error) {
      logger.warn(`Validation error: ${error.message}`);
      return ResUtil.badRequest({ res, message: error.message });
    }

    const brandRepository = getRepository(Brand);
    const brand = await brandRepository.findOneBy({ id });

    if (!brand) {
      logger.warn(`Brand not found with ID: ${id}`);
      return ResUtil.notFound({ res, message: 'Brand not found' });
    }

    brandRepository.merge(brand, req.body);
    const updatedBrand = await brandRepository.save(brand);

    logger.info(`Brand updated successfully: ${id}`);
    return ResUtil.success({ res, message: 'Brand updated successfully', data: updatedBrand });
  } catch (error) {
    logger.error('Error updating brand', error);
    return ResUtil.internalError({ res, message: 'Error updating brand', data: error });
  }
};

// Delete a brand by ID
export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const brandRepository = getRepository(Brand);
    const brand = await brandRepository.findOneBy({ id });

    if (!brand) {
      logger.warn(`Brand not found with ID: ${id}`);
      return ResUtil.notFound({ res, message: 'Brand not found' });
    }

    await brandRepository.remove(brand);

    logger.info(`Brand deleted successfully: ${id}`);
    return ResUtil.noContent({ res, message: 'Brand deleted successfully' });
  } catch (error) {
    logger.error('Error deleting brand', error);
    return ResUtil.internalError({ res, message: 'Error deleting brand', data: error });
  }
};
