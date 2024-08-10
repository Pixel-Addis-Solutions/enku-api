import Joi from 'joi';

export const subCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),  // min length 2, max length 50
  categoryId: Joi.number().required()  
});