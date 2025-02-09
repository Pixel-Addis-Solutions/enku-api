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


interface TokenData {
  access_token: string;
  refresh_token?: string; // Optional because it might not always be returned
  expires_in: number; // Number of seconds until the token expires
}
