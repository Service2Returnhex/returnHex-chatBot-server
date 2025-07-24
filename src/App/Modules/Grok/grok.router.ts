import express from "express";
import { GrokController } from "./grok.controller";
const router = express.Router();

router.get("/response", GrokController.getResponse);

export const GorkRouter = router;
