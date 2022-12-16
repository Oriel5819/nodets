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
exports.editPassword = exports.editProfile = exports.profile = void 0;
const userModel_1 = require("../models/userModel");
// import {} from "../services/userService";
const profile = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    if (!request.user)
        return response.status(400).send({ message: "Authentication required" });
    const foundUser = yield userModel_1.Users.findOne({ email: request.user, isVerified: true });
    if (!foundUser)
        return response.status(400).send({ message: "Unabled to find a user profile" });
    return response.status(200).send({
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
        balance: foundUser.balance.current,
        carry: foundUser.balance.carry.filter((carry) => !carry.accepted),
    });
});
exports.profile = profile;
const editProfile = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = Object.keys(request.body);
    const allowedToBeUpdate = ["firstName", "lastName", "address"];
    const { firstName, lastName, address } = request.body;
    const isValidOperation = updates.every((update) => allowedToBeUpdate.includes(update));
    if (!request.user)
        return response.status(400).send({ message: "Authentication required" });
    if (!isValidOperation)
        return response.status(400).send({ message: "Invalid updates" });
    const updatedUser = yield userModel_1.Users.findOneAndUpdate({ email: request.user }, { firstName, lastName, address }, { new: true, runValidators: true });
    if (!updatedUser)
        return response.status(400).send({ message: "Unabled to update user profile" });
    return response.status(200).send({ message: "User profile updated." });
});
exports.editProfile = editProfile;
const editPassword = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.status(200).send("profile");
});
exports.editPassword = editPassword;
