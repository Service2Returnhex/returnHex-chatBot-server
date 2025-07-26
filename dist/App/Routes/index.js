"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatgpt_route_1 = require("../Modules/Chatgpt/chatgpt.route");
const gemini_route_1 = require("../Modules/Gemini/gemini.route");
const webhook_route_1 = require("../Modules/WebHook/webhook.route");
const page_route_1 = require("../Modules/Page/page.route");
const deepseek_route_1 = require("../Modules/DeepSeek/deepseek.route");
const grok_route_1 = require("../Modules/Groq/grok.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/webhook',
        route: webhook_route_1.WebhookRouter
    },
    {
        path: '/chatgpt',
        route: chatgpt_route_1.ChatgptRouter
    },
    {
        path: '/gemini',
        route: gemini_route_1.GeminiRouter
    },
    {
        path: '/deepseek',
        route: deepseek_route_1.DeepSeekRouter
    },
    {
        path: '/groq',
        route: grok_route_1.GroqRouter
    },
    {
        path: '/page',
        route: page_route_1.PageRouter
    }
];
moduleRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
