import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { globalLimiter, authLimiter } from "./middlewares/rateLimit.middleware";
import { env } from "./config/env";

import authRoutes from "@/routes/auth.routes";
import workspaceRoutes from "@/routes/workspace.routes";
import boardRoutes from "@/routes/board.routes";
import taskRoutes from "@/routes/task.routes";
import aiRoutes from "@/routes/ai.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";

import { apiReference } from "@scalar/express-api-reference";

const app = express();

const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, server-to-server) with no Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(globalLimiter);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Elevoria Backend Running",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(
  "/scalar",
  (_req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https:",
        "worker-src 'self' blob:",
      ].join("; "),
    );
    next();
  },
  apiReference({ content: swaggerSpec }),
);

/* Future routes here */
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/board", boardRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
