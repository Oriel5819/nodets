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
exports.logoutService = exports.loginService = exports.resetPasswordService = exports.resendCodeService = exports.verificationService = exports.registerService = void 0;
const userModel_1 = require("../models/userModel");
const registerService = ({ email, password, confirmPassword }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email)
        return { statusCode: 400, message: "Email is required" };
    if (!password)
        return { statusCode: 400, message: "Password is required" };
    if (!confirmPassword)
        return { statusCode: 400, message: "Password is required" };
    if ([email, password, confirmPassword].every(Boolean)) {
        if (yield userModel_1.Users.findOne({ email }))
            return { statusCode: 400, message: "User already exists" };
    }
    yield new userModel_1.Users({
        email,
        password,
        verificationCode: {
            code: Math.floor(10000000 + Math.random() * 99999999).toString(),
            expiredOn: new Date(Date.now() + 1000 * 60 * 3),
        },
    })
        .save()
        .then(() => console.log("User has been registered"));
    return { statusCode: 201, message: "Registered" };
});
exports.registerService = registerService;
const resendCodeService = ({ email }) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationCode = {
        code: Math.floor(10000000 + Math.random() * 99999999).toString(),
        expiredOn: new Date(Date.now() + 1000 * 60 * 3),
    };
    if (!email)
        return { statusCode: 400, message: "Email is required" };
    const { statusCode, message } = yield userModel_1.Users.sendEmail(email, verificationCode);
    return { statusCode, message };
});
exports.resendCodeService = resendCodeService;
const verificationService = ({ email, code }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!email)
        return { statusCode: 400, message: "Email is required" };
    if (!code)
        return { statusCode: 400, message: "The verification code is required" };
    if (yield userModel_1.Users.findOne({ email, isVerified: true }))
        return { statusCode: 401, message: "Account already verified" };
    const foundUser = yield userModel_1.Users.findOne({ email, isVerified: false });
    if (!foundUser)
        return { statusCode: 400, message: "Invalid Email" };
    if (((_a = foundUser === null || foundUser === void 0 ? void 0 : foundUser.verificationCode) === null || _a === void 0 ? void 0 : _a.code) !== code) {
        return { statusCode: 400, message: "Invalid code" };
    }
    const expireTime = Math.floor(new Date((_b = foundUser === null || foundUser === void 0 ? void 0 : foundUser.verificationCode) === null || _b === void 0 ? void 0 : _b.expiredOn).getTime());
    if (expireTime < Date.now())
        return { statusCode: 400, message: "Expired code" };
    yield userModel_1.Users.updateOne({ email, verificationCode: null, isVerified: true });
    return { statusCode: 200, message: "Account has been verified" };
});
exports.verificationService = verificationService;
const resetPasswordService = ({ email, resetCode, password, confirmPassword }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email)
        return { statusCode: 400, message: "Email is required" };
    if (!resetCode)
        return { statusCode: 400, message: "ResetCode is required" };
    if (!password)
        return { statusCode: 400, message: "Password is required" };
    if (!confirmPassword)
        return { statusCode: 400, message: "Password is required" };
    if (yield userModel_1.Users.findOne({ email, isVerified: false }))
        return { statusCode: 400, message: "Unverified account" };
    const foundUser = yield userModel_1.Users.findOne({ email, isVerified: true });
    if (foundUser && foundUser.verificationCode.code === resetCode && password === confirmPassword) {
        const { statusCode, message } = yield userModel_1.Users.resetPassword(email, password);
        return { statusCode, message };
    }
    else
        return { statusCode: 400, message: "Error occured while resetting password" };
});
exports.resetPasswordService = resetPasswordService;
const loginService = ({ email, password }) => __awaiter(void 0, void 0, void 0, function* () { });
exports.loginService = loginService;
const logoutService = () => __awaiter(void 0, void 0, void 0, function* () { });
exports.logoutService = logoutService;
