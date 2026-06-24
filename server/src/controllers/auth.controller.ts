import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/utils/apiError";
import { ApiResponse } from "@/utils/apiResponse";
import { generateAccessToken, generateRefreshToken } from "@/utils/token";
import { hashPassword, comparePassword } from "@/utils/password";
import { sanitizeUser } from "@/utils/sanitizeUser";
import { setRefreshCookie, clearRefreshCookie } from "@/utils/cookies";
import { randomToken, minutesFromNow, daysFromNow } from "@/utils/randomToken";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/services/email.service";
import { googleClient } from "@/config/google";
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

  const emailVerifyToken = randomToken();

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      emailVerifyToken,
      emailVerifyExpires: daysFromNow(1),
    },
  });

  await sendVerificationEmail(user.email, emailVerifyToken);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  setRefreshCookie(res, refreshToken);

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

  // Accounts created via Google sign-in have no password.
  if (!user.password) {
    throw new ApiError(400, "This account uses Google sign-in");
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

  setRefreshCookie(res, refreshToken);

  res.json(
    new ApiResponse("Login successful", {
      user: sanitizeUser(user),
      accessToken,
    }),
  );
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
        userId: string;
      };
      // Only clear the stored token if it still matches (avoids racing a newer session).
      await prisma.user.updateMany({
        where: { id: decoded.userId, refreshToken: token },
        data: { refreshToken: null },
      });
    } catch {
      // expired/invalid token — nothing to revoke server-side
    }
  }

  clearRefreshCookie(res);

  res.json(new ApiResponse("Logged out successfully"));
});


export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) throw new ApiError(401, "No refresh token");

  let decoded: { userId: string };
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Rotate: issue a fresh refresh token and invalidate the old one.
  const accessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  setRefreshCookie(res, newRefreshToken);

  res.json(new ApiResponse("Access token refreshed", { accessToken }));
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { credential } = req.body;

  if (!googleClient || !env.GOOGLE_CLIENT_ID) {
    throw new ApiError(500, "Google sign-in is not configured");
  }

  // Verify the ID token issued by Google to the frontend.
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new ApiError(401, "Invalid Google credential");
  }

  if (!payload?.sub || !payload.email) {
    throw new ApiError(401, "Invalid Google credential");
  }

  const googleId = payload.sub;
  const email = payload.email;

  // Match by googleId first, then by email (links an existing email account).
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        fullName: payload.name ?? email.split("@")[0],
        email,
        googleId,
        avatar: payload.picture ?? null,
        isEmailVerified: true,
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        googleId,
        avatar: user.avatar ?? payload.picture ?? null,
        isEmailVerified: true,
      },
    });
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  setRefreshCookie(res, refreshToken);

  res.json(
    new ApiResponse("Google sign-in successful", {
      user: sanitizeUser(user),
      accessToken,
    }),
  );
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: token,
      emailVerifyExpires: { gt: new Date() },
    },
  });

  if (!user) throw new ApiError(400, "Invalid or expired verification link");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  });

  res.json(new ApiResponse("Email verified successfully"));
});

export const resendVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ApiError(404, "User not found");
    if (user.isEmailVerified) {
      throw new ApiError(400, "Email already verified");
    }

    const emailVerifyToken = randomToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyExpires: daysFromNow(1) },
    });

    await sendVerificationEmail(user.email, emailVerifyToken);

    res.json(new ApiResponse("Verification email sent"));
  },
);

export const requestPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Only act if the account exists, but never reveal that to the caller.
    if (user) {
      const passwordResetToken = randomToken();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken,
          passwordResetExpires: minutesFromNow(60),
        },
      });
      await sendPasswordResetEmail(user.email, passwordResetToken);
    }

    res.json(
      new ApiResponse(
        "If an account exists for that email, a reset link has been sent",
      ),
    );
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) throw new ApiError(400, "Invalid or expired reset link");

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        // Invalidate existing sessions after a password reset.
        refreshToken: null,
      },
    });

    res.json(new ApiResponse("Password reset successfully"));
  },
);