import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/utils/apiError";
import { ApiResponse } from "@/utils/apiResponse";
import { generateAccessToken, generateRefreshToken } from "@/utils/token";
import { hashPassword, comparePassword } from "@/utils/password";
import { sanitizeUser } from "@/utils/sanitizeUser";
import { env } from "@/config/env";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
    },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json(
    new ApiResponse("User registered successfully", {
      user: sanitizeUser(user),
      accessToken,
    }),
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isvalid = await comparePassword(password, user.password);

  if (!isvalid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json(
    new ApiResponse("Login successfull", {
      user: sanitizeUser(user),
      accessToken,
    }),
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const decoded: any = jwt.decode(token);

    if (decoded?.userId) {
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { refreshToken: null },
      });
    }
  }

  res.clearCookie("refreshToken");

  res.json(new ApiResponse("Logged out successfully"));
});


export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) throw new ApiError(401, "No refresh token");

  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const accessToken = generateAccessToken(user.id);

  res.json(new ApiResponse("Access token refreshed", { accessToken }));
});