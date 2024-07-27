// src/middleware/session.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const ensureSessionId = (req: any, res: Response, next: NextFunction) => {
  if (!req.cookies.sessionId) {
    const sessionId = uuidv4();
    res.cookie('sessionId', sessionId, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
    req.sessionId = sessionId;
  } else {
    req.sessionId = req.cookies.sessionId;
  }
  next();
};
