"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const databas_1 = require("./App/config/databas");
const config_1 = require("./App/config/config");
const PORT = config_1.config.port;
(0, databas_1.connectDB)();
//server
app_1.default.listen(PORT, () => {
    console.log(`Server is listening at: http://localhost:${PORT}`);
});
