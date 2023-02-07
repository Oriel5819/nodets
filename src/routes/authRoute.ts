import { Request, Response, NextFunction, Router } from "express";
import { ensureAuthenticated } from "../middleware/authentication";
import { register, verifyCode, resendCode, resetPassword, login, logout } from "../controllers/authController";
import passport from "passport";

const authRoute = Router();

authRoute.post("/register", register);
authRoute.post("/verify-code", verifyCode);
authRoute.post("/resend-code", resendCode);
authRoute.post("/reset-password", resetPassword);
authRoute.post("/login", login);
authRoute.get("/logout", ensureAuthenticated, logout);

authRoute.all("*", (request: Request, response: Response) => response.status(404).send({ message: "404 Not Found" }));

export { authRoute };
