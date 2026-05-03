import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/apiError";

export const errorMiddleware = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err instanceof ApiError ? err.errors : undefined,
  });
};
