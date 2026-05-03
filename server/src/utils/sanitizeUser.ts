import { User } from "@prisma/client";

export const sanitizeUser = (user: User) => {
  const { password, refreshToken, ...safeUser } = user;
  return safeUser;
};
