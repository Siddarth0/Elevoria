import { User } from "@prisma/client";

export const sanitizeUser = (user: User) => {
  const {
    password,
    refreshToken,
    emailVerifyToken,
    emailVerifyExpires,
    passwordResetToken,
    passwordResetExpires,
    ...safeUser
  } = user;

  // Silence unused-var lint while intentionally dropping these fields.
  void password;
  void refreshToken;
  void emailVerifyToken;
  void emailVerifyExpires;
  void passwordResetToken;
  void passwordResetExpires;

  return safeUser;
};
