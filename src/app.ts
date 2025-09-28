import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { globalErrorHanlder } from "./App/Middlewares/globalErrorHandler";
import notFound from "./App/Middlewares/notFound";
import router from "./App/Routes";
const app = express();

app.use(
  cors({})
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("Welcome to hex-bot latest(v1.1.0) Server");
});

app.get("/api/health", (req, res) => {
  res.send("Server health is very good!");
});

app.use(notFound);
app.use(globalErrorHanlder);

export default app;
