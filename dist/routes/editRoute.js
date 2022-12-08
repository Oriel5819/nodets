"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editRoute = void 0;
const express_1 = require("express");
// import { getList, changeStatus, setWatched } from "../controllers/localController";
const editRoute = (0, express_1.Router)();
exports.editRoute = editRoute;
editRoute.get("/information", () => { });
editRoute.post("/password", () => { });
