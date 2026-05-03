import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { ApiError } from "@/utils/apiError";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;

  if (!header) {
    next(new ApiError(401, "No token provided"));
    return;
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
    };
    req.user = decoded;
    next();
  } catch {
    next(new ApiError(401, "Invalid token"));
  }
};
