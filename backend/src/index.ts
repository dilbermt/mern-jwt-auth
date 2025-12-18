import express from "express";
import "dotenv/config";
import connectToDatabase from "./config/db";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler";
import { OK } from "./constants/http";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: APP_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/", (req, res, next) => {
  return res.status(OK).json({ status: "healthy" });
});

app.use(errorHandler);

app.listen(PORT, async () => {
  await connectToDatabase();
  console.log(`server running on ${PORT} in ${NODE_ENV} mode`);
});
