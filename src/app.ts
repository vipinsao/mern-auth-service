import "reflect-metadata";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import logger from "./config/logger.js";
import type { HttpError } from "http-errors";

import authRouter from "./routes/auth.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Auth Service");
});

app.use("/auth", authRouter);

// creating global error handler middleware
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: "",
        location: "",
      },
    ],
  });
  next(err);
});

export default app;
