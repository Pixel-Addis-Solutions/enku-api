// src/types/express.d.ts
import "express";
import { Customer } from "../entities/customer";

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      user?: {
        id: string;
      };
    }
  }
}
