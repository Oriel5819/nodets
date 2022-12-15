"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = require("nodemailer");
const transporter = (0, nodemailer_1.createTransport)({
    service: "gmail",
    auth: {
        user: "orielvillam@gmail.com",
        pass: "ibsatylqyjasjrkh",
    },
    tls: {
        rejectUnauthorized: false,
    },
});
exports.transporter = transporter;
