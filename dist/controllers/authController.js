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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.resetPassword = exports.resendCode = exports.verifyCode = exports.register = void 0;
const passport_1 = __importDefault(require("passport"));
const authService_1 = require("../services/authService");
const register = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, confirmPassword } = request.body;
    const { statusCode, message } = yield (0, authService_1.registerService)({
        email,
        password,
        confirmPassword,
    });
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
    const { statusCode, message } = yield (0, authService_1.resetPasswordService)({
        email,
        resetCode,
        password,
        confirmPassword,
    });
    response.status(statusCode).send({ message });
});
exports.resetPassword = resetPassword;
const login = (request, response, next) => {
    try {
        passport_1.default.authenticate("local", function (error, user, info) {
            if (error)
                return next(error);
            if (!user)
                return response.send({ message: info.message });
            request.logIn(user, (error) => {
                if (error)
                    next(error);
                response.status(200).send({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    balance: user.balance.current,
                    email: user.email,
                    isActivated: user.isActivated,
                    isVerified: user.isVerified,
                    isAdmin: user.isAdmin,
                    isTeller: user.isTeller,
                });
            });
        })(request, response, next);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    return request.logout((error) => {
        if (error)
            return next(error);
        response.status(200).send({ message: "Logged out" });
    });
});
exports.logout = logout;
