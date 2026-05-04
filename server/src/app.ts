import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { ApiResponse } from "./utils/apiResponse";

import authRoutes from "@/routes/auth.routes";
import workspaceRoutes from "@/routes/workspace.routes";
import boardRoutes from "@/routes/board.routes";
import taskRoutes from "@/routes/task.routes";
import aiRoutes from "@/routes/ai.routes"

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Elevoria Backend Running",
  });
});

/* Future routes here */
app.use("/api/auth", authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/board", boardRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/ai", aiRoutes)

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
