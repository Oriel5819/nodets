"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticationRoute = void 0;
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authenticationRoute = (0, express_1.Router)();
exports.authenticationRoute = authenticationRoute;
authenticationRoute.get("/", authController_1.welcome);
authenticationRoute.post("/register", authController_1.register);
authenticationRoute.post("/login", authController_1.login);
authenticationRoute.post("/logout", authController_1.logout);