import { Request, Response } from "express";
import { Users } from "../models/userModel";

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
  if (!target) return response.status(400).send({ message: "No target user found." });

  if ((me.balance.current as number) - amount < 0) return response.status(400).send({ message: "Insufficient balance" });

  const currentTime = new Date();
  const rest = (me.balance.current as number) - amount;
  let subOperation: [{ description: String; type: String; account: String; amount: Number; date: Date }] = me.balance.operations;
  subOperation.push({ description, type: "withdrawal", account: accountTargetId, amount, date: currentTime });
  let sentCarry: [{ description: String; type: String; account: String; amount: Number; accepted: Boolean; date: Date }] = me.balance.carry;
  sentCarry.push({ description, type: "sent", account: target.id, amount, accepted: false, date: currentTime });

  let sumOperation: [{ description: String; type: String; account: String; amount: Number; date: Date }] = target.balance.operations;
  sumOperation.push({ description, type: "deposit", account: me.id, amount, date: currentTime });
  let receivedCarry: [{ description: String; type: String; account: String; amount: Number; accepted: Boolean; date: Date }] = target.balance.carry;
  receivedCarry.push({ description, type: "received", account: target.id, amount, accepted: false, date: currentTime });

  await Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: rest, operations: subOperation, carry: sentCarry } });
  await Users.updateOne({ _id: accountTargetId }, { balance: { operations: sumOperation, carry: receivedCarry } });

  return response.status(200).send({ message: amount + " has been transfered to " + target.firstName });
};

const recallSent = async (request: Request, response: Response) => {
  const { accountTargetId, carryId } = request.params;

  const me = await Users.findOne({ email: request.user, isVerified: true, isActivated: true });
  const target = await Users.findById(accountTargetId);

  if (!me) return response.status(400).send({ message: "No user found." });
  if (!target) return response.status(400).send({ message: "No target user was found." });

  const [foundTransfer] = me.balance.carry.filter((carry) => carry.id.toString() === carryId.toString() && !carry.accepted && carry.type === "sent");

  if (!foundTransfer) return response.status(400).send({ message: "No operation was found." });

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

  await Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: myCurrentBalance, operations: myOperation, carry: myCarry } });
  await Users.updateOne({ _id: accountTargetId }, { balance: { operations: targetOperation, carry: targetCarry } });

  return response.status(200).send(foundTransfer);
};

export { requestSend, recallSent };
