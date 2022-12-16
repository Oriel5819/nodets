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
exports.recallSent = exports.requestSend = void 0;
const userModel_1 = require("../models/userModel");
const requestSend = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
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
        return response.status(400).send({ message: "No user was found." });
    if (!target)
        return response.status(400).send({ message: "No target user found." });
    if (me.balance.current - amount < 0)
        return response.status(400).send({ message: "Insufficient balance" });
    const currentTime = new Date();
    const rest = me.balance.current - amount;
    let subOperation = me.balance.operations;
    subOperation.push({ description, type: "withdrawal", account: accountTargetId, amount, date: currentTime });
    let sentCarry = me.balance.carry;
    sentCarry.push({ description, type: "sent", account: target.id, amount, accepted: false, date: currentTime });
    let sumOperation = target.balance.operations;
    sumOperation.push({ description, type: "deposit", account: me.id, amount, date: currentTime });
    let receivedCarry = target.balance.carry;
    receivedCarry.push({ description, type: "received", account: target.id, amount, accepted: false, date: currentTime });
    yield userModel_1.Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: rest, operations: subOperation, carry: sentCarry } });
    yield userModel_1.Users.updateOne({ _id: accountTargetId }, { balance: { operations: sumOperation, carry: receivedCarry } });
    return response.status(200).send({ message: amount + " has been transfered to " + target.firstName });
});
exports.requestSend = requestSend;
const recallSent = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountTargetId, carryId } = request.params;
    const me = yield userModel_1.Users.findOne({ email: request.user, isVerified: true, isActivated: true });
    const target = yield userModel_1.Users.findById(accountTargetId);
    if (!me)
        return response.status(400).send({ message: "No user found." });
    if (!target)
        return response.status(400).send({ message: "No target user was found." });
    const [foundTransfer] = me.balance.carry.filter((carry) => carry.id.toString() === carryId.toString() && !carry.accepted && carry.type === "sent");
    if (!foundTransfer)
        return response.status(400).send({ message: "No operation was found." });
    let myCarry = me.balance.carry;
    let myCurrentBalance = me.balance.current;
    let myOperation = me.balance.operations;
    // CHANGE ME CARRY TYPE AND CURRENT BALANCE
    for (let carry of myCarry) {
        if (carry.id.toString() === carryId.toString()) {
            carry.type = "recalled";
            myCurrentBalance += carry.amount;
        }
    }
    // CHANGE ME OPERATION TYPE
    for (let operation of myOperation) {
        if (operation.id.toString() === carryId.toString()) {
            operation.type = "recalled";
        }
    }
    let targetCarry = target.balance.carry;
    let targetOperation = target.balance.operations;
    // CHANGE TARGET CARRY TYPE AND CURRENT BALANCE
    for (let carry of targetCarry) {
        if (carry.id.toString() === carryId.toString()) {
            carry.type = "recalled";
        }
    }
    // CHANGE TARGET OPERATION TYPE
    for (let operation of targetOperation) {
        if (operation.id.toString() === carryId.toString()) {
            operation.type = "recalled";
        }
    }
    yield userModel_1.Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: myCurrentBalance, operations: myOperation, carry: myCarry } });
    yield userModel_1.Users.updateOne({ _id: accountTargetId }, { balance: { operations: targetOperation, carry: targetCarry } });
    return response.status(200).send(foundTransfer);
});
exports.recallSent = recallSent;
