// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { response } from "../utils/responseHandler";
// import { UserRole } from "../types/user";

// export interface AuthRequest extends Request {
//   user?: {
//     id: string;
//     email: string;
//     role: UserRole;
//     username?: string;
//   };
// }

// export const auth = () => (
//   req: Request, 
//   res: Response, 
//   next: NextFunction
// ) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       return response.err(res, "No token provided", 401);
//     }

//     const decoded = jwt.verify(token, process.env.SECRET_KEY!) as {
//       id: string;
//       email: string;
//       role: UserRole;
//       username?: string;
//     };

//     if (roles.length && !roles.includes(decoded.role)) {
//       return response.err(res, `Access denied. Required role: ${roles.join(" or ")}`, 403);
//     }

//     (req as AuthRequest).user = decoded;
//     next();
//   } catch (error) {
//     return response.err(res, "Invalid token", 401);
//   }
// };
