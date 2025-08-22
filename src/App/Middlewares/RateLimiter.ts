const rateLimit = require("express-rate-limit");
import type { Request, Response } from "express";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // allow 5 login attempts per ip per 15 min
  message: { error: "Too many login attempts, try again later." },
});

export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // depends on expected events
  handler: (req: Request, res: Response) => {
    // webhooks often require 2xx; respond 429 if throttled
    res.status(429).send("Too many webhook requests");
  },
});
