// src/types/express.d.ts
import "express";
import { Customer } from "../entities/customer";
import { User } from '../entities/user';

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      user?: {
        id: string;
      };
    }
    interface User {
      id: string;
    }
  }
}
