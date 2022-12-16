import { Request, Response } from "express";
import { Users } from "../models/userModel";
import { v4 as uuidv4 } from "uuid";
import { ICarry, IOperation } from "../interfaces";

const requestSend = async (request: Request, response: Response) => {
  const { accountTargetId } = request.params;
  const { amount, description } = request.body;
  const updates = Object.keys(request.body);
  const allowedToBeUpdate = ["amount", "description"];
  const isValidOperation = updates.every((update) => allowedToBeUpdate.includes(update));

  if (!isValidOperation) return response.status(400).send({ message: "Invalid updates" });

  const me = await Users.findOne({ email: request.user, isVerified: true, isActivated: true });
  const target = await Users.findById(accountTargetId);

  if (!me) return response.status(400).send({ message: "No user was found." });
  if (me._id.toString() === accountTargetId.toString()) return response.status(400).send({ message: "Auto funds not allowed." });
  if (!target) return response.status(400).send({ message: "No target user found." });

  if ((me.balance.current as number) - amount < 0) return response.status(400).send({ message: "Insufficient balance" });

  const commonId = uuidv4();
  const currentTime = new Date();
  const rest = (me.balance.current as number) - amount;
  let subOperation: [IOperation] = me.balance.operations;
  subOperation.push({ id: commonId, description, type: "withdrawal", account: accountTargetId, amount, isAccepted: false, isRejected: false, isRecalled: false, date: currentTime });
  let sentCarry: [ICarry] = me.balance.carry;
  sentCarry.push({ id: commonId, description, type: "sent", account: target.id, amount, isAccepted: false, isRejected: false, isRecalled: false, sentDate: currentTime, acceptedDate: null });

  let sumOperation: [IOperation] = target.balance.operations;
  sumOperation.push({ id: commonId, description, type: "deposit", account: me.id, amount, isAccepted: false, isRejected: false, isRecalled: false, date: currentTime });
  let receivedCarry: [ICarry] = target.balance.carry;
  receivedCarry.push({ id: commonId, description, type: "received", account: target.id, amount, isAccepted: false, isRejected: false, isRecalled: false, sentDate: currentTime, acceptedDate: null });

  await Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: rest, operations: subOperation, carry: sentCarry } });
  await Users.updateOne({ _id: accountTargetId }, { balance: { current: target.balance.current, operations: sumOperation, carry: receivedCarry } });

  return response.status(200).send({ message: amount + " has been transfered to " + target.firstName });
};

const recallSent = async (request: Request, response: Response) => {
  const { accountTargetId, carryId } = request.params;

  const me = await Users.findOne({ email: request.user, isVerified: true, isActivated: true });
  const target = await Users.findById(accountTargetId);

  if (!me) return response.status(400).send({ message: "No user found." });
  if (me._id.toString() === accountTargetId.toString()) return response.status(400).send({ message: "Unauthorized action." });
  if (!target) return response.status(400).send({ message: "No target user was found." });

  const [foundTransfer] = me.balance.carry.filter((carry) => carry.id === carryId && carry.type === "sent" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
  const [foundReceived] = target.balance.carry.filter((carry) => carry.id === carryId && carry.type === "received" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);

  if (!foundTransfer) return response.status(400).send({ message: "No operation was found." });
  if (!foundReceived) return response.status(400).send({ message: "No operation was found." });

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
    if (operation.id === carryId && operation.type === "withdrawal") operation.isRecalled = true;
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
    if (operation.id === carryId && operation.type === "deposit") operation.isRecalled = true;
  }

  await Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: myCurrentBalance, operations: myOperation, carry: myCarry } });
  await Users.updateOne({ _id: accountTargetId }, { balance: { current: target.balance.current, operations: targetOperation, carry: targetCarry } });

  return response.status(200).send({ id: foundTransfer.id, isRecalled: foundTransfer.isRecalled });
};

const acceptReceive = async (request: Request, response: Response) => {
  const { senderId, carryId } = request.params;

  const me = await Users.findOne({ email: request.user, isVerified: true, isActivated: true });
  const sender = await Users.findById(senderId);

  if (!me) return response.status(400).send({ message: "No user was found." });
  if (!sender) return response.status(400).send({ message: "No sender user was found." });
  if (me._id.toString() === senderId) return response.status(400).send({ message: "Unauthorized action." });

  const [foundTransfer] = me.balance.carry.filter((carry) => carry.id === carryId && carry.type === "received" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
  const [foundSent] = sender.balance.carry.filter((carry) => carry.id === carryId && carry.type === "sent" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);

  if (!foundTransfer) return response.status(400).send({ message: "No operation was found." });
  if (!foundSent) return response.status(400).send({ message: "No operation was found." });

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
    if (operation.id === carryId && operation.type === "withdrawal") operation.isAccepted = true;
  }

  await Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: myCurrentBalance, operations: myOperation, carry: myCarry } });
  await Users.updateOne({ _id: senderId }, { balance: { current: sender.balance.current, operations: senderOperation, carry: senderCarry } });

  response.send({ message: foundTransfer.amount + " has been added to your account." });
};

const cancelReceive = async (request: Request, response: Response) => {
  const { senderId, carryId } = request.params;

  const me = await Users.findOne({ email: request.user, isVerified: true, isActivated: true });
  const sender = await Users.findById(senderId);

  if (!me) return response.status(400).send({ message: "No user was found." });
  if (!sender) return response.status(400).send({ message: "No sender user was found." });
  if (me._id.toString() === senderId) return response.status(400).send({ message: "Unauthorized action." });

  const [foundTransfer] = me.balance.carry.filter((carry) => carry.id === carryId && carry.type === "received" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
  const [foundSent] = sender.balance.carry.filter((carry) => carry.id === carryId && carry.type === "sent" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);

  if (!foundTransfer) return response.status(400).send({ message: "No operation was found." });
  if (!foundSent) return response.status(400).send({ message: "No operation was found." });

  let myCarry = me.balance.carry;
  let myOperation = me.balance.operations;

  // CHANGE ME CARRY TYPE AND CURRENT BALANCE
  for (let carry of myCarry) {
    if (carry.id === carryId && carry.type === "received") carry.isRejected = true;
  }

  // CHANGE ME OPERATION
  for (let operation of myOperation) {
    if (operation.id === carryId && operation.type === "deposit") operation.isRejected = true;
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

  await Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: me.balance.current, operations: myOperation, carry: myCarry } });
  await Users.updateOne({ _id: senderId }, { balance: { current: senderCurrentBalance, operations: senderOperation, carry: senderCarry } });

  response.send({ message: "Receiving has been declined." });
};

const requestAskReceive = async (request: Request, response: Response) => {
  const { accountTargetId } = request.params;
  const { amount, description } = request.body;
  const updates = Object.keys(request.body);
  const allowedToBeUpdate = ["amount", "description"];
  const isValidOperation = updates.every((update) => allowedToBeUpdate.includes(update));

  if (!isValidOperation) return response.status(400).send({ message: "Invalid updates" });

  const me = await Users.findOne({ email: request.user, isVerified: true, isActivated: true });
  const target = await Users.findById(accountTargetId);

  if (!me) return response.status(400).send({ message: "No user was found." });
  if (me._id.toString() === accountTargetId.toString()) return response.status(400).send({ message: "Auto ask not allowed." });
  if (!target) return response.status(400).send({ message: "No target user found." });

  const commonId = uuidv4();
  const currentTime = new Date();
  let myOperation: [IOperation] = me.balance.operations;
  myOperation.push({ id: commonId, description, type: "deposit", account: accountTargetId, amount, isAccepted: false, isRejected: false, isRecalled: false, date: currentTime });
  let myCarry: [ICarry] = me.balance.carry;
  myCarry.push({ id: commonId, description, type: "ask-receive", account: target.id, amount, isAccepted: false, isRejected: false, isRecalled: false, sentDate: currentTime, acceptedDate: null });

  let targetOperation: [IOperation] = target.balance.operations;
  targetOperation.push({ id: commonId, description, type: "withdrawal", account: me.id, amount, isAccepted: false, isRejected: false, isRecalled: false, date: currentTime });
  let targetCarry: [ICarry] = target.balance.carry;
  targetCarry.push({ id: commonId, description, type: "ask-send", account: target.id, amount, isAccepted: false, isRejected: false, isRecalled: false, sentDate: currentTime, acceptedDate: null });

  await Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: me.balance.current, operations: myOperation, carry: myCarry } });
  await Users.updateOne({ _id: accountTargetId }, { balance: { current: target.balance.current, operations: targetOperation, carry: targetCarry } });

  return response.status(200).send({ message: "You have asked " + amount + " from " + target.firstName + ". Reason: " + description });
};

const recallAskReceive = async (request: Request, response: Response) => {
  const { accountTargetId, carryId } = request.params;

  const me = await Users.findOne({ email: request.user, isVerified: true, isActivated: true });
  const target = await Users.findById(accountTargetId);

  if (!me) return response.status(400).send({ message: "No user found." });
  if (me._id.toString() === accountTargetId.toString()) return response.status(400).send({ message: "Unauthorized action." });
  if (!target) return response.status(400).send({ message: "No target user was found." });

  const [foundTransfer] = me.balance.carry.filter((carry) => carry.id === carryId && carry.type === "ask-receive" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
  const [foundReceived] = target.balance.carry.filter((carry) => carry.id === carryId && carry.type === "ask-send" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);

  if (!foundTransfer) return response.status(400).send({ message: "No operation was found." });
  if (!foundReceived) return response.status(400).send({ message: "No operation was found." });

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
    if (operation.id === carryId && operation.type === "deposit") operation.isRecalled = true;
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
    if (operation.id === carryId && operation.type === "withdrawal") operation.isRecalled = true;
  }

  await Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: me.balance.current, operations: myOperation, carry: myCarry } });
  await Users.updateOne({ _id: accountTargetId }, { balance: { current: target.balance.current, operations: targetOperation, carry: targetCarry } });

  return response.status(200).send({ id: foundTransfer.id, isRecalled: foundTransfer.isRecalled });
};

const acceptAskReceive = async (request: Request, response: Response) => {
  const { senderId, carryId } = request.params;

  const me = await Users.findOne({ email: request.user, isVerified: true, isActivated: true });
  const sender = await Users.findById(senderId);

  if (!me) return response.status(400).send({ message: "No user was found." });
  if (!sender) return response.status(400).send({ message: "No sender user was found." });
  if (me._id.toString() === senderId) return response.status(400).send({ message: "Unauthorized action." });

  const [foundTransfer] = me.balance.carry.filter((carry) => carry.id === carryId && carry.type === "ask-send" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);
  const [foundSent] = sender.balance.carry.filter((carry) => carry.id === carryId && carry.type === "ask-receive" && !carry.isAccepted && !carry.isRecalled && !carry.isRejected);

  if (!foundTransfer) return response.status(400).send({ message: "No operation was found." });
  if (!foundSent) return response.status(400).send({ message: "No operation was found." });

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
    if (operation.id === carryId && operation.type === "withdrawal") operation.isAccepted = true;
  }

  await Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: myCurrentBalance, operations: myOperation, carry: myCarry } });
  await Users.updateOne({ _id: senderId }, { balance: { current: sender.balance.current, operations: senderOperation, carry: senderCarry } });

  response.send({ message: foundTransfer.amount + " has been added to your account." });
};

export { requestSend, recallSent, acceptReceive, cancelReceive, requestAskReceive, recallAskReceive, acceptAskReceive };
