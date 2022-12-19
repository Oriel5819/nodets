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
exports.acceptAskReceive = exports.recallAskReceive = exports.requestAskReceive = exports.cancelReceive = exports.acceptReceive = exports.recallSent = exports.requestSend = void 0;
const userModel_1 = require("../models/userModel");
const uuid_1 = require("uuid");
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
    if (me._id.toString() === accountTargetId.toString())
        return response.status(400).send({ message: "Auto funds not allowed." });
    if (!target)
        return response.status(400).send({ message: "No target user found." });
    if (me.balance.current - amount < 0)
        return response.status(400).send({ message: "Insufficient balance" });
    const commonId = (0, uuid_1.v4)();
    const currentTime = new Date();
    const rest = me.balance.current - amount;
    let subOperation = me.balance.operations;
    subOperation.push({ id: commonId, description, type: "withdrawal", account: accountTargetId, amount, isAccepted: false, isRejected: false, isRecalled: false, date: currentTime });
    let sentCarry = me.balance.carry;
    sentCarry.push({ id: commonId, description, type: "sent", account: target.id, amount, isAccepted: false, isRejected: false, isRecalled: false, sentDate: currentTime, acceptedDate: null });
    let sumOperation = target.balance.operations;
    sumOperation.push({ id: commonId, description, type: "deposit", account: me.id, amount, isAccepted: false, isRejected: false, isRecalled: false, date: currentTime });
    let receivedCarry = target.balance.carry;
    receivedCarry.push({ id: commonId, description, type: "received", account: target.id, amount, isAccepted: false, isRejected: false, isRecalled: false, sentDate: currentTime, acceptedDate: null });
    yield userModel_1.Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: rest, operations: subOperation, carry: sentCarry } });
    yield userModel_1.Users.updateOne({ _id: accountTargetId }, { balance: { current: target.balance.current, operations: sumOperation, carry: receivedCarry } });
    return response.status(200).send({ message: amount + " has been transfered to " + target.firstName });
});
exports.requestSend = requestSend;
const recallSent = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountTargetId, carryId } = request.params;
    const me = yield userModel_1.Users.findOne({ email: request.user, isVerified: true, isActivated: true });
    const target = yield userModel_1.Users.findById(accountTargetId);
    if (!me)
        return response.status(400).send({ message: "No user found." });
    if (me._id.toString() === accountTargetId.toString())
        return response.status(400).send({ message: "Unauthorized action." });
    if (!target)
        return response.status(400).send({ message: "No target user was found." });
    const [foundTransfer] = me.balance.carry.filter((carry) => carry.id === carryId && carry.type === "sent" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
    const [foundReceived] = target.balance.carry.filter((carry) => carry.id === carryId && carry.type === "received" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
    if (!foundTransfer)
        return response.status(400).send({ message: "No operation was found." });
    if (!foundReceived)
        return response.status(400).send({ message: "No operation was found." });
    const currentTime = new Date();
    let myCarry = me.balance.carry;
    let myCurrentBalance = me.balance.current;
    let myOperation = me.balance.operations;
    // CHANGE ME CARRY TYPE AND CURRENT BALANCE
    for (let carry of myCarry) {
        if (carry.id === carryId && carry.type === "sent") {
            carry.isRecalled = true;
            carry.acceptedDate = currentTime;
            myCurrentBalance += carry.amount;
        }
    }
    // CHANGE ME OPERATION TYPE
    for (let operation of myOperation) {
        if (operation.id === carryId && operation.type === "withdrawal")
            operation.isRecalled = true;
    }
    let targetCarry = target.balance.carry;
    let targetOperation = target.balance.operations;
    // CHANGE TARGET CARRY TYPE AND CURRENT BALANCE
    for (let carry of targetCarry) {
        if (carry.id === carryId && carry.type === "received") {
            carry.isRecalled = true;
            carry.acceptedDate = currentTime;
        }
    }
    // CHANGE TARGET OPERATION TYPE
    for (let operation of targetOperation) {
        if (operation.id === carryId && operation.type === "deposit")
            operation.isRecalled = true;
    }
    yield userModel_1.Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: myCurrentBalance, operations: myOperation, carry: myCarry } });
    yield userModel_1.Users.updateOne({ _id: accountTargetId }, { balance: { current: target.balance.current, operations: targetOperation, carry: targetCarry } });
    return response.status(200).send({ id: foundTransfer.id, isRecalled: foundTransfer.isRecalled });
});
exports.recallSent = recallSent;
const acceptReceive = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, carryId } = request.params;
    const me = yield userModel_1.Users.findOne({ email: request.user, isVerified: true, isActivated: true });
    const sender = yield userModel_1.Users.findById(senderId);
    if (!me)
        return response.status(400).send({ message: "No user was found." });
    if (!sender)
        return response.status(400).send({ message: "No sender user was found." });
    if (me._id.toString() === senderId)
        return response.status(400).send({ message: "Unauthorized action." });
    const [foundTransfer] = me.balance.carry.filter((carry) => carry.id === carryId && carry.type === "received" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
    const [foundSent] = sender.balance.carry.filter((carry) => carry.id === carryId && carry.type === "sent" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
    if (!foundTransfer)
        return response.status(400).send({ message: "No operation was found." });
    if (!foundSent)
        return response.status(400).send({ message: "No operation was found." });
    const currentTime = new Date();
    let myCarry = me.balance.carry;
    let myCurrentBalance = me.balance.current;
    let myOperation = me.balance.operations;
    // CHANGE ME CARRY TYPE AND CURRENT BALANCE
    for (let carry of myCarry) {
        if (carry.id === carryId && carry.type === "received") {
            carry.isAccepted = true;
            myCurrentBalance += carry.amount;
            carry.acceptedDate = currentTime;
        }
    }
    // CHANGE ME OPERATION
    for (let operation of myOperation) {
        if (operation.id === carryId && operation.type === "deposit") {
            operation.isAccepted = true;
        }
    }
    let senderCarry = sender.balance.carry;
    let senderOperation = sender.balance.operations;
    // CHANGE SENDER CARRY TYPE AND CURRENT BALANCE
    for (let carry of senderCarry) {
        if (carry.id === carryId && carry.type === "sent") {
            carry.isAccepted = true;
            carry.acceptedDate = currentTime;
        }
    }
    // CHANGE SENDER CARRY TYPE AND CURRENT BALANCE
    for (let operation of senderOperation) {
        if (operation.id === carryId && operation.type === "withdrawal")
            operation.isAccepted = true;
    }
    yield userModel_1.Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: myCurrentBalance, operations: myOperation, carry: myCarry } });
    yield userModel_1.Users.updateOne({ _id: senderId }, { balance: { current: sender.balance.current, operations: senderOperation, carry: senderCarry } });
    response.send({ message: foundTransfer.amount + " has been added to your account." });
});
exports.acceptReceive = acceptReceive;
const cancelReceive = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, carryId } = request.params;
    const me = yield userModel_1.Users.findOne({ email: request.user, isVerified: true, isActivated: true });
    const sender = yield userModel_1.Users.findById(senderId);
    if (!me)
        return response.status(400).send({ message: "No user was found." });
    if (!sender)
        return response.status(400).send({ message: "No sender user was found." });
    if (me._id.toString() === senderId)
        return response.status(400).send({ message: "Unauthorized action." });
    const [foundTransfer] = me.balance.carry.filter((carry) => carry.id === carryId && carry.type === "received" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
    const [foundSent] = sender.balance.carry.filter((carry) => carry.id === carryId && carry.type === "sent" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
    if (!foundTransfer)
        return response.status(400).send({ message: "No operation was found." });
    if (!foundSent)
        return response.status(400).send({ message: "No operation was found." });
    let myCarry = me.balance.carry;
    let myOperation = me.balance.operations;
    // CHANGE ME CARRY TYPE AND CURRENT BALANCE
    for (let carry of myCarry) {
        if (carry.id === carryId && carry.type === "received")
            carry.isRejected = true;
    }
    // CHANGE ME OPERATION
    for (let operation of myOperation) {
        if (operation.id === carryId && operation.type === "deposit")
            operation.isRejected = true;
    }
    let senderCarry = sender.balance.carry;
    let senderCurrentBalance = sender.balance.current;
    let senderOperation = sender.balance.operations;
    // CHANGE SENDER CARRY TYPE AND CURRENT BALANCE
    for (let carry of senderCarry) {
        if (carry.id === carryId && carry.type === "sent") {
            senderCurrentBalance += carry.amount;
            carry.isRejected = true;
        }
    }
    // CHANGE SENDER OPERATION
    for (let operation of senderOperation) {
        if (operation.id === carryId && operation.type === "deposit") {
            operation.isRejected = true;
        }
    }
    yield userModel_1.Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: me.balance.current, operations: myOperation, carry: myCarry } });
    yield userModel_1.Users.updateOne({ _id: senderId }, { balance: { current: senderCurrentBalance, operations: senderOperation, carry: senderCarry } });
    response.send({ message: "Receiving has been declined." });
});
exports.cancelReceive = cancelReceive;
const requestAskReceive = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
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
    if (me._id.toString() === accountTargetId.toString())
        return response.status(400).send({ message: "Auto ask not allowed." });
    if (!target)
        return response.status(400).send({ message: "No target user found." });
    const commonId = (0, uuid_1.v4)();
    const currentTime = new Date();
    let myOperation = me.balance.operations;
    myOperation.push({ id: commonId, description, type: "deposit", account: accountTargetId, amount, isAccepted: false, isRejected: false, isRecalled: false, date: currentTime });
    let myCarry = me.balance.carry;
    myCarry.push({ id: commonId, description, type: "ask-receive", account: target.id, amount, isAccepted: false, isRejected: false, isRecalled: false, sentDate: currentTime, acceptedDate: null });
    let targetOperation = target.balance.operations;
    targetOperation.push({ id: commonId, description, type: "withdrawal", account: me.id, amount, isAccepted: false, isRejected: false, isRecalled: false, date: currentTime });
    let targetCarry = target.balance.carry;
    targetCarry.push({ id: commonId, description, type: "ask-send", account: target.id, amount, isAccepted: false, isRejected: false, isRecalled: false, sentDate: currentTime, acceptedDate: null });
    yield userModel_1.Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: me.balance.current, operations: myOperation, carry: myCarry } });
    yield userModel_1.Users.updateOne({ _id: accountTargetId }, { balance: { current: target.balance.current, operations: targetOperation, carry: targetCarry } });
    return response.status(200).send({ message: "You have asked " + amount + " from " + target.firstName + ". Reason: " + description });
});
exports.requestAskReceive = requestAskReceive;
const recallAskReceive = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountTargetId, carryId } = request.params;
    const me = yield userModel_1.Users.findOne({ email: request.user, isVerified: true, isActivated: true });
    const target = yield userModel_1.Users.findById(accountTargetId);
    if (!me)
        return response.status(400).send({ message: "No user found." });
    if (me._id.toString() === accountTargetId.toString())
        return response.status(400).send({ message: "Unauthorized action." });
    if (!target)
        return response.status(400).send({ message: "No target user was found." });
    const [foundTransfer] = me.balance.carry.filter((carry) => carry.id === carryId && carry.type === "ask-receive" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
    const [foundReceived] = target.balance.carry.filter((carry) => carry.id === carryId && carry.type === "ask-send" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
    if (!foundTransfer)
        return response.status(400).send({ message: "No operation was found." });
    if (!foundReceived)
        return response.status(400).send({ message: "No operation was found." });
    const currentTime = new Date();
    let myCarry = me.balance.carry;
    let myOperation = me.balance.operations;
    // CHANGE ME CARRY TYPE AND CURRENT BALANCE
    for (let carry of myCarry) {
        if (carry.id === carryId && carry.type === "ask-receive") {
            carry.isRecalled = true;
            carry.acceptedDate = currentTime;
        }
    }
    // CHANGE ME OPERATION TYPE
    for (let operation of myOperation) {
        if (operation.id === carryId && operation.type === "deposit")
            operation.isRecalled = true;
    }
    let targetCarry = target.balance.carry;
    let targetOperation = target.balance.operations;
    // CHANGE TARGET CARRY TYPE AND CURRENT BALANCE
    for (let carry of targetCarry) {
        if (carry.id === carryId && carry.type === "ask-send") {
            carry.isRecalled = true;
            carry.acceptedDate = currentTime;
        }
    }
    // CHANGE TARGET OPERATION TYPE
    for (let operation of targetOperation) {
        if (operation.id === carryId && operation.type === "withdrawal")
            operation.isRecalled = true;
    }
    yield userModel_1.Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: me.balance.current, operations: myOperation, carry: myCarry } });
    yield userModel_1.Users.updateOne({ _id: accountTargetId }, { balance: { current: target.balance.current, operations: targetOperation, carry: targetCarry } });
    return response.status(200).send({ id: foundTransfer.id, isRecalled: foundTransfer.isRecalled });
});
exports.recallAskReceive = recallAskReceive;
const acceptAskReceive = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, carryId } = request.params;
    const me = yield userModel_1.Users.findOne({ email: request.user, isVerified: true, isActivated: true });
    const sender = yield userModel_1.Users.findById(senderId);
    if (!me)
        return response.status(400).send({ message: "No user was found." });
    if (!sender)
        return response.status(400).send({ message: "No sender user was found." });
    if (me._id.toString() === senderId)
        return response.status(400).send({ message: "Unauthorized action." });
    const [foundTransfer] = me.balance.carry.filter((carry) => carry.id === carryId && carry.type === "ask-send" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
    const [foundSent] = sender.balance.carry.filter((carry) => carry.id === carryId && carry.type === "ask-receive" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
    if (!foundTransfer)
        return response.status(400).send({ message: "No operation was found." });
    if (!foundSent)
        return response.status(400).send({ message: "No operation was found." });
    const currentTime = new Date();
    let myCarry = me.balance.carry;
    let myCurrentBalance = me.balance.current;
    let myOperation = me.balance.operations;
    // CHANGE ME CARRY TYPE AND CURRENT BALANCE
    for (let carry of myCarry) {
        if (carry.id === carryId && carry.type === "ask-send") {
            carry.isAccepted = true;
            myCurrentBalance -= carry.amount;
            carry.acceptedDate = currentTime;
        }
    }
    // CHANGE ME OPERATION
    for (let operation of myOperation) {
        if (operation.id === carryId && operation.type === "deposit") {
            operation.isAccepted = true;
        }
    }
    let senderCarry = sender.balance.carry;
    let senderOperation = sender.balance.operations;
    // CHANGE SENDER CARRY TYPE AND CURRENT BALANCE
    for (let carry of senderCarry) {
        if (carry.id === carryId && carry.type === "sent") {
            carry.isAccepted = true;
            carry.acceptedDate = currentTime;
        }
    }
    // CHANGE SENDER CARRY TYPE AND CURRENT BALANCE
    for (let operation of senderOperation) {
        if (operation.id === carryId && operation.type === "withdrawal")
            operation.isAccepted = true;
    }
    yield userModel_1.Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: myCurrentBalance, operations: myOperation, carry: myCarry } });
    yield userModel_1.Users.updateOne({ _id: senderId }, { balance: { current: sender.balance.current, operations: senderOperation, carry: senderCarry } });
    response.send({ message: foundTransfer.amount + " has been added to your account." });
});
exports.acceptAskReceive = acceptAskReceive;
