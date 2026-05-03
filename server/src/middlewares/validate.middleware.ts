import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/apiError";

export const validate =
  (schema: ZodType<any>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new ApiError(400, "Validation failed", result.error.flatten()));
      return;
    }

    req.body = result.data;
    next();
  };
