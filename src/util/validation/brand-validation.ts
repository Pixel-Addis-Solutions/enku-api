import Joi from 'joi';

export const brandSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(255).optional().allow("").allow(null),
});
