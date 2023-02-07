"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoute = void 0;
const express_1 = require("express");
const authentication_1 = require("../middleware/authentication");
const authController_1 = require("../controllers/authController");
const authRoute = (0, express_1.Router)();
exports.authRoute = authRoute;
authRoute.post("/register", authController_1.register);
authRoute.post("/verify-code", authController_1.verifyCode);
authRoute.post("/resend-code", authController_1.resendCode);
authRoute.post("/reset-password", authController_1.resetPassword);
authRoute.post("/login", authController_1.login);
authRoute.get("/logout", authentication_1.ensureAuthenticated, authController_1.logout);
authRoute.all("*", (request, response) => response.status(404).send({ message: "404 Not Found" }));