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
exports.withdraw = exports.deposit = exports.statement = void 0;
const userModel_1 = require("../models/userModel");
const uuid_1 = require("uuid");
const statement = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const me = yield userModel_1.Users.findOne({ email: request.user, isVerified: true, isActivated: true });
    if (!me)
        return response.status(400).send({ message: "No user found." });
    return response.status(200).send(me.balance.operations);
});
exports.statement = statement;
const deposit = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountTargetId } = request.params;
    const { amount, description } = request.body;
    const updates = Object.keys(request.body);
    const allowedToBeUpdate = ["amount", "description"];
    const isValidOperation = updates.every((update) => allowedToBeUpdate.includes(update));
    if (!isValidOperation)
        return response.status(400).send({ message: "Invalid updates" });
    const me = yield userModel_1.Users.findOne({ email: request.user, isVerified: true, isActivated: true });
    const target = yield userModel_1.Users.findById(accountTargetId);
    if (!me)
        return response.status(400).send({ message: "No user found." });
    if (!target)
        return response.status(400).send({ message: "No target user found." });
    if (!me.isTeller || me._id.toString() === accountTargetId.toString())
        return response.status(400).send({ message: "Unauthorized action." });
    if (me.balance.current - amount < 0)
        return response.status(400).send({ message: "Insufficient balance" });
    const commonId = (0, uuid_1.v4)();
    const currentTime = new Date();
    const rest = me.balance.current - amount;
    let subOperation = me.balance.operations;
    subOperation.push({ id: commonId, description, type: "withdrawal", account: accountTargetId, amount, date: currentTime });
    const sum = target.balance.current + amount;
    let sumOperation = target.balance.operations;
    sumOperation.push({ id: commonId, description, type: "deposit", account: me.id, amount, date: currentTime });
    yield userModel_1.Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: rest, operations: subOperation } });
    yield userModel_1.Users.updateOne({ _id: accountTargetId }, { balance: { current: sum, operations: sumOperation } });
    return response.status(200).send({ message: amount + " has been deposited to your account." });
});
exports.deposit = deposit;
const withdraw = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountTargetId } = request.params;
    const { amount, description } = request.body;
    const updates = Object.keys(request.body);
    const allowedToBeUpdate = ["amount", "description"];
    const isValidOperation = updates.every((update) => allowedToBeUpdate.includes(update));
    if (!isValidOperation)
        return response.status(400).send({ message: "Invalid updates" });
    const me = yield userModel_1.Users.findOne({ email: request.user, isVerified: true, isActivated: true });
    const target = yield userModel_1.Users.findById(accountTargetId);
    if (!me)
        return response.status(400).send({ message: "No user found." });
    if (!target)
        return response.status(400).send({ message: "No target user found." });
    if (!me.isTeller || me._id.toString() === accountTargetId.toString())
        return response.status(400).send({ message: "Unauthorized action." });
    if (target.balance.current - amount < 0)
        return response.status(400).send({ message: "Insufficient balance" });
    const commonId = (0, uuid_1.v4)();
    const currentTime = new Date();
    const rest = target.balance.current - amount;
    let subOperation = target.balance.operations;
    subOperation.push({ id: commonId, description, type: "withdrawal", account: me.id, amount, date: currentTime });
    const sum = me.balance.current + amount;
    let sumOperation = me.balance.operations;
    sumOperation.push({ id: commonId, description, type: "deposit", account: accountTargetId, amount, date: currentTime });
    yield userModel_1.Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: sum, operations: sumOperation } });
    yield userModel_1.Users.updateOne({ _id: accountTargetId }, { balance: { current: rest, operations: subOperation } });
    return response.status(200).send({ message: amount + " has been withdrawn from your account." });
});
exports.withdraw = withdraw;
