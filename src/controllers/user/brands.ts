// src/controllers/brand.controller.ts
import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { Brand } from '../../entities/brand';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brandRepository = getRepository(Brand);

    const brands = await brandRepository.find();

    return ResUtil.success({
      res,
      message: 'Brands fetched successfully',
      data: brands,
    });
  } catch (error) {
    logger.error(`Error fetching brands: ${error}`);
    return ResUtil.internalError({ res, message: 'Error fetching brands', data: error });
  }
};
