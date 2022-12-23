import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Users } from "../models/userModel";
// import {} from "../services/userService";

const profile = async (request: Request, response: Response) => {
  if (!request.user) return response.status(400).send({ message: "Authentication required" });

  const foundUser = await Users.findOne({ email: request.user, isVerified: true });
  if (!foundUser) return response.status(400).send({ message: "Unabled to find a user profile" });

  return response.status(200).send({
    id: foundUser._id,
    firstName: foundUser.firstName,
    lastName: foundUser.lastName,
    email: foundUser.email,
    balance: foundUser.balance.current,
    carry: foundUser.balance.carry.filter((carry) => !carry.isAccepted && !carry.isRejected && !carry.isRecalled),
  });
};

const editProfile = async (request: Request, response: Response) => {
  const updates = Object.keys(request.body);
  const allowedToBeUpdate = ["firstName", "lastName", "address"];
  const { firstName, lastName, address } = request.body;
  const isValidOperation = updates.every((update) => allowedToBeUpdate.includes(update));

  if (!request.user) return response.status(400).send({ message: "Authentication required" });

  if (!isValidOperation) return response.status(400).send({ message: "Invalid updates" });

  const updatedUser = await Users.findOneAndUpdate({ email: request.user }, { firstName, lastName, address }, { new: true, runValidators: true });

  if (!updatedUser) return response.status(400).send({ message: "Unabled to update user profile" });

  return response.status(200).send({ message: "User profile updated." });
};

const editPassword = async (request: Request, response: Response) => {
  response.status(200).send("profile");
};

export { profile, editProfile, editPassword };
