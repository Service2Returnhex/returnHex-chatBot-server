import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { globalErrorHanlder } from "./App/Middlewares/globalErrorHandler";
import notFound from "./App/Middlewares/notFound";
import { MessengerRouter } from "./App/Modules/Messenger/messenger.route";
import router from "./App/Routes";
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);
app.use("/messenger", MessengerRouter);
app.get("/", (req, res) => {
  res.send("Hello Server");
});

app.use(notFound);
app.use(globalErrorHanlder);

export default app;
