import { Response } from 'express';

export const response = {
  ok: <T>(res: Response, data: T) => {
    return res.status(200).json({
      status: "Ok",
      data
    });
  },
  
  err: (res: Response, message: string, statusCode: number = 500) => {
    return res.status(statusCode).json({
      status: "Error",
      error: message
    });
  }
};