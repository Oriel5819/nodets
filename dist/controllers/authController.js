"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = exports.welcome = void 0;
const authService_1 = require("../services/authService");
const welcome = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.status(200).render("welcome");
});
exports.welcome = welcome;
const register = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { mail, password, confirmPassword } = request.body;
    response.status(200).send(yield (0, authService_1.registerService)({ mail, password, confirmPassword }));
});
exports.register = register;
const login = (request, response) => __awaiter(void 0, void 0, void 0, function* () { });
exports.login = login;
const logout = (request, response) => __awaiter(void 0, void 0, void 0, function* () { });
exports.logout = logout;
