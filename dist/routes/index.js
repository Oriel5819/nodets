"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const express_1 = require("express");
const route = (0, express_1.Router)();
exports.route = route;
route.get("/register", (request, response) => response.render("register"));
route.get("/login", (request, response) => response.render("login"));
route.get("/", (request, response) => response.render("welcome"));
