"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongodbConnect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const consola_1 = __importDefault(require("consola"));
const mongodbConnect = (mongo_uri) => {
    mongoose_1.default
        .set("strictQuery", true)
        .connect(mongo_uri)
        .then(() => consola_1.default.success({ badge: true, message: "Connected to Mongodb" }))
        .catch(() => consola_1.default.error({ badge: true, message: "Cannot connect to Mongodb" }));
};
exports.mongodbConnect = mongodbConnect;
