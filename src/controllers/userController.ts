import { Request, Response, NextFunction } from "express";
import { loginService, registerService, verificationService, resendCodeService, resetPasswordService } from "../services/authService";

const welcome = async (request: Request, response: Response) => {
  response.status(200).send("welcome");
};

const register = async (request: Request, response: Response) => {
  const { email, password, confirmPassword } = request.body;
  const { statusCode, message } = await registerService({ email, password, confirmPassword });
  response.status(statusCode).send({ message });
};

const verifyCode = async (request: Request, response: Response) => {
  const { email, code } = request.body;
  const { statusCode, message } = await verificationService({ email, code });
  response.status(statusCode).send({ message });
};

const resendCode = async (request: Request, response: Response) => {
  const { email } = request.body;
  const { statusCode, message } = await resendCodeService({ email });
  response.status(statusCode).send({ message });
};

const resetPassword = async (request: Request, response: Response) => {
  const { email, resetCode, password, confirmPassword } = request.body;
  const { statusCode, message } = await resetPasswordService({ email, resetCode, password, confirmPassword });
  response.status(statusCode).send({ message });
};

const login = async (request: Request, response: Response) => {
  const { email, password } = request.body;
  response.status(200).send(await loginService({ email, password }));
};

const logout = async (request: Request, response: Response) => {};

const profile = async (request: Request, response: Response) => {
  console.log('logged in');
  response.status(200).send("profile");
};

const editProfile = async (request: Request, response: Response) => {
  response.status(200).send("profile");
};

const editPassword = async (request: Request, response: Response) => {
  response.status(200).send("profile");
};

export { welcome, register, verifyCode, resendCode, resetPassword, login, logout, profile, editProfile, editPassword };
