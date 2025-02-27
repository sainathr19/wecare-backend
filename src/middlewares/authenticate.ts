import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { handleError } from "../utils/errorUtility";

dotenv.config();

interface AuthRequest extends Request {
  username?: string;
}

const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const jwtToken = req.cookies?.authToken;

    if (!jwtToken) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid JWT Token" });
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error("Secret key is missing from environment variables");
    }

    jwt.verify(
      jwtToken,
      secretKey,
      (
        error: jwt.VerifyErrors | null,
        payload: string | JwtPayload | undefined
      ) => {
        if (error) {
          return res
            .status(401)
            .json({ status: "error", message: error.message });
        }

        const decodedPayload = payload as JwtPayload;
        req.username = decodedPayload.username;
        next();
      }
    );
  } catch (error) {
    return handleError(res, error);
  }
};

export default authenticateToken;
