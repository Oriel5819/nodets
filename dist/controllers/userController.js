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
exports.editPassword = exports.editProfile = exports.profile = exports.logout = exports.login = exports.resetPassword = exports.resendCode = exports.verifyCode = exports.register = exports.welcome = void 0;
const authService_1 = require("../services/authService");
const welcome = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.status(200).send("welcome");
});
exports.welcome = welcome;
const register = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, confirmPassword } = request.body;
    const { statusCode, message } = yield (0, authService_1.registerService)({ email, password, confirmPassword });
    response.status(statusCode).send({ message });
});
exports.register = register;
const verifyCode = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code } = request.body;
    const { statusCode, message } = yield (0, authService_1.verificationService)({ email, code });
    response.status(statusCode).send({ message });
});
exports.verifyCode = verifyCode;
const resendCode = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = request.body;
    const { statusCode, message } = yield (0, authService_1.resendCodeService)({ email });
    response.status(statusCode).send({ message });
});
exports.resendCode = resendCode;
const resetPassword = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, resetCode, password, confirmPassword } = request.body;
    const { statusCode, message } = yield (0, authService_1.resetPasswordService)({ email, resetCode, password, confirmPassword });
    response.status(statusCode).send({ message });
});
exports.resetPassword = resetPassword;
const login = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = request.body;
    response.status(200).send(yield (0, authService_1.loginService)({ email, password }));
});
exports.login = login;
const logout = (request, response) => __awaiter(void 0, void 0, void 0, function* () { });
exports.logout = logout;
const profile = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.status(200).send("profile");
});
exports.profile = profile;
const editProfile = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.status(200).send("profile");
});
exports.editProfile = editProfile;
const editPassword = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.status(200).send("profile");
});
exports.editPassword = editPassword;
