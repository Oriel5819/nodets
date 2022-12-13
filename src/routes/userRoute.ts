import { Request, Response, Router } from "express";
import passport from "passport";
import { ensureAuthenticated } from "../middleware/authentication";
import { welcome, register, verifyCode, resendCode, resetPassword, login, profile, editProfile, editPassword } from "../controllers/userController";

const userRoute = Router();

userRoute.get("/", welcome);
userRoute.get("/me", ensureAuthenticated, profile);
userRoute.post("/register", register);
userRoute.post("/verify-code", verifyCode);
userRoute.post("/resend-code", resendCode);
userRoute.post("/reset-password", resetPassword);
userRoute.post("/login", passport.authenticate("local"), login);
// userRoute.get("/logout", ensureAuthenticated, logout);
userRoute.post("/edit-profile", editProfile);
userRoute.post("/edit-password", editPassword);

export { userRoute };
