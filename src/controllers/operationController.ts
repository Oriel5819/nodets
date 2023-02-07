import { Request, Response } from "express";
import { Users } from "../models/userModel";
import { v4 as uuidv4 } from "uuid";

const statement = async (request: Request, response: Response) => {
  const me = await Users.findOne({ email: request.user, isVerified: true, isActivated: true });
  if (!me) return response.status(400).send({ message: "No user found." });

  return response.status(200).send(me.balance.operations);
};

const deposit = async (request: Request, response: Response) => {
  const { accountTargetId } = request.params;
  const { amount, description } = request.body;
  const updates = Object.keys(request.body);
  const allowedToBeUpdate = ["amount", "description"];
  const isValidOperation = updates.every((update) => allowedToBeUpdate.includes(update));

  if (!isValidOperation) return response.status(400).send({ message: "Invalid updates" });

  const me = await Users.findOne({ email: request.user, isVerified: true, isActivated: true });
  const target = await Users.findById(accountTargetId);

  if (!me) return response.status(400).send({ message: "No user found." });
  if (!target) return response.status(400).send({ message: "No target user found." });
  if (!me.isTeller || me._id.toString() === accountTargetId.toString()) return response.status(400).send({ message: "Unauthorized action." });

  if ((me.balance.current as number) - amount < 0) return response.status(400).send({ message: "Insufficient balance" });

  const commonId = uuidv4();
  const currentTime = new Date();
  const rest = (me.balance.current as number) - amount;
  let subOperation: [{ id: string; description: string; type: string; account: string; amount: Number; date: Date }] = me.balance.operations;
  subOperation.push({ id: commonId, description, type: "withdrawal", account: accountTargetId, amount, date: currentTime });

  const sum = (target.balance.current as number) + amount;
  let sumOperation: [{ id: string; description: string; type: string; account: string; amount: Number; date: Date }] = target.balance.operations;
  sumOperation.push({ id: commonId, description, type: "deposit", account: me.id, amount, date: currentTime });

  await Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: rest, operations: subOperation } });
  await Users.updateOne({ _id: accountTargetId }, { balance: { current: sum, operations: sumOperation } });

  return response.status(200).send({ message: amount + " has been deposited to your account." });
};

const withdraw = async (request: Request, response: Response) => {
  const { accountTargetId } = request.params;
  const { amount, description } = request.body;
  const updates = Object.keys(request.body);
  const allowedToBeUpdate = ["amount", "description"];
  const isValidOperation = updates.every((update) => allowedToBeUpdate.includes(update));

  if (!isValidOperation) return response.status(400).send({ message: "Invalid updates" });

  const me = await Users.findOne({ email: request.user, isVerified: true, isActivated: true });
  const target = await Users.findById(accountTargetId);

  if (!me) return response.status(400).send({ message: "No user found." });
  if (!target) return response.status(400).send({ message: "No target user found." });
  if (!me.isTeller || me._id.toString() === accountTargetId.toString()) return response.status(400).send({ message: "Unauthorized action." });

  if ((target.balance.current as number) - amount < 0) return response.status(400).send({ message: "Insufficient balance" });

  const commonId = uuidv4();
  const currentTime = new Date();
  const rest = (target.balance.current as number) - amount;
  let subOperation: [{ id: string; description: string; type: string; account: string; amount: Number; date: Date }] = target.balance.operations;
  subOperation.push({ id: commonId, description, type: "withdrawal", account: me.id, amount, date: currentTime });

  const sum = (me.balance.current as number) + amount;
  let sumOperation: [{ id: string; description: string; type: string; account: string; amount: Number; date: Date }] = me.balance.operations;
  sumOperation.push({ id: commonId, description, type: "deposit", account: accountTargetId, amount, date: currentTime });

  await Users.updateOne({ email: request.user, isVerified: true, isActivated: true }, { balance: { current: sum, operations: sumOperation } });
  await Users.updateOne({ _id: accountTargetId }, { balance: { current: rest, operations: subOperation } });

  return response.status(200).send({ message: amount + " has been withdrawn from your account." });
};

export { statement, deposit, withdraw };
