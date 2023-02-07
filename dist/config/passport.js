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
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const userModel_1 = require("../models/userModel");
passport_1.default.serializeUser((user, done) => done(null, user.id));
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const foundUser = yield userModel_1.Users.findById(id);
        if (foundUser)
            done(null, foundUser.email);
        else
            done(null, false);
    }
    catch (error) {
        done(error, false);
    }
}));
passport_1.default.use(new passport_local_1.Strategy({ usernameField: "email" }, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const foundUser = yield userModel_1.Users.findOne({ email });
        if (!foundUser)
            return done(null, false, { message: "Invalid email" });
        if (!(foundUser === null || foundUser === void 0 ? void 0 : foundUser.isVerified))
            return done(null, false, { message: "Unverified user" });
        if (!(yield (0, userModel_1.comparePassword)(password, foundUser === null || foundUser === void 0 ? void 0 : foundUser.password)))
            done(null, false, { message: "Wrong password" });
        done(null, foundUser);
    }
    catch (error) {
        done(error, null);
    }
})));
