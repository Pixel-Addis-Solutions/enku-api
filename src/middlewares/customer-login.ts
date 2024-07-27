// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from '../data-source';
import { User } from '../entities/user';

export const authenticateUser = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      const userRepository = getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.id } });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  next();
};
