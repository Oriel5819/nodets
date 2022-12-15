"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountStatusRoute = void 0;
const express_1 = require("express");
const accountStatusRoute = (0, express_1.Router)();
exports.accountStatusRoute = accountStatusRoute;
accountStatusRoute.post("/active", () => { });
accountStatusRoute.post("/desactive", () => { });
accountStatusRoute.post("/delete", () => { });
