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
exports.Users = void 0;
const validator_1 = __importDefault(require("validator"));
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const sendEmail_1 = require("../middleware/sendEmail");
// SEND EMAIL
const sendingEmail = (email, code) => {
    // sending verification email
    let mailOptions = {
        from: `" FVola" <orielvillam@gmail.com>`,
        to: email,
        subject: `FVola --account verification email--`,
        html: `<h2>Thanks for registering on FVola<h2>
            <h4>Please use this code to verify your accountt.<h4>
            <h4 style="padding: 10px; background-color: purple; color: white">${code}</h4>
            <h4>This code will be expired in three (3) minutes<h4>`,
    };
    sendEmail_1.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            throw new Error("Error occured while sending verification email");
            // console.log(error);
        }
        else {
            console.log(`Verification email has been sent to ${email}`);
            // console.log(info);
            // callback();
        }
    });
};
// ! hashing password
const hashingPassword = (entredPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt_1.default.genSalt(10);
    return yield bcrypt_1.default.hash(entredPassword, salt);
});
const UserSchema = new mongoose_1.Schema({
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: {
        type: String,
        trim: true,
        require: true,
        unique: true,
        lowercase: true,
        validator(value) {
            if (!validator_1.default.isEmail(value))
                throw new Error("Invalid email");
        },
    },
    password: {
        type: String,
        trim: true,
        require: true,
        minlength: 8,
        validator(value) {
            if (value.toLowerCase().includes("password"))
                throw new Error("Password cannot contain the word 'password'");
        },
    },
    isAdmin: { type: Boolean, default: false },
    isActivated: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationCode: {
        code: { type: String, trim: true },
        expiredOn: { type: Date, trim: true, default: Date.now },
    },
}, { timestamps: true });
// ! send email
UserSchema.static("sendEmail", (email, { code, expiredOn }) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield exports.Users.find({ email })) {
        sendingEmail(email, code);
        yield exports.Users.updateOne({ email, verificationCode: { code, expiredOn } });
        return { statusCode: 200, message: "Code has been sent successfully." };
    }
    else
        return { statusCode: 400, message: "User does not exist." };
}));
// ! reset password
UserSchema.static("resetPassword", (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.Users.updateOne({ email, password: yield hashingPassword(password) });
    return { statusCode: 200, message: "Password reset" };
}));
// ! after saving a user
UserSchema.pre("save", function (next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // if the password has not modified
            if (!this.isModified("password")) {
                next();
            }
            this.password = yield hashingPassword((_a = this.password) !== null && _a !== void 0 ? _a : "");
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// ! after saving a user
UserSchema.post("save", function (doc, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            sendingEmail(this.email, (_a = this.verificationCode) === null || _a === void 0 ? void 0 : _a.code);
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
exports.Users = (0, mongoose_1.model)("User", UserSchema);
