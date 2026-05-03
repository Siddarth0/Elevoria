import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { ApiResponse } from "./utils/apiResponse";

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

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
