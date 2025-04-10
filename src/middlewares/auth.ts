import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { response } from '../utils/responseHandler';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        response.err(res, "Authentication token is required", 401);
        return;
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    response.err(res, "Invalid token", 401);
  }
};