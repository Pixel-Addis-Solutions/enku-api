import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { User } from '../../entities/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger'; // Adjust the import path according to your project structure

const JWT_SECRET = process.env.JWT_SECRET || ""; // Move this to environment variables in production

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
  
    // Validate input
    if (!email || !password) {
      logger.warn('Email and password are required');
      return ResUtil.badRequest({ res, message: 'Email and password are required' });
    }
 
    const userRepository = getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      logger.warn(`Invalid credentials for email: ${email}`);
      return ResUtil.unAuthorized({ res, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logger.warn(`Invalid credentials for email: ${email}`);
      return ResUtil.unAuthorized({ res, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    logger.info(`User logged in: ${email}`);
    return ResUtil.success({ res, message: 'Login successful', data: { accessToken } });
  } catch (error) {
    logger.error('Error logging in', error);
    return ResUtil.internalError({ res, message: 'Error logging in', data: error });
  }
};
