import { OAuth2Client } from "google-auth-library";
import { env } from "@/config/env";

// Used to verify Google ID tokens sent from the frontend sign-in button.
export const googleClient = env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(env.GOOGLE_CLIENT_ID)
  : null;
