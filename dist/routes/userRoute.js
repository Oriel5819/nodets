"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
const express_1 = require("express");
const authentication_1 = require("../middleware/authentication");
const userController_1 = require("../controllers/userController");
const userRoute = (0, express_1.Router)();
exports.userRoute = userRoute;
userRoute.get("/me", authentication_1.ensureAuthenticated, userController_1.profile);
userRoute.patch("/edit-profile", authentication_1.ensureAuthenticated, userController_1.editProfile);
userRoute.patch("/edit-password", authentication_1.ensureAuthenticated, userController_1.editPassword);
userRoute.all("*", (request, response) => response.status(404).send({ message: "404 Not Found" }));
