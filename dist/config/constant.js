"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.MONGO_URI = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: "./.env" });
_a = process.env, exports.MONGO_URI = _a.MONGO_URI, exports.PORT = _a.PORT;
