import { Router } from "express";
import { welcome, register, verifyCode, resendCode, resetPassword, login, logout, profile, editProfile, editPassword } from "../controllers/userController";

const userRoute = Router();

userRoute.get("/", welcome);
userRoute.get("/profile", profile);
userRoute.post("/register", register);
userRoute.post("/verify-code", verifyCode);
userRoute.post("/resend-code", resendCode);
userRoute.post("/reset-password", resetPassword);
userRoute.post("/login", login);
userRoute.post("/logout", logout);
userRoute.post("/edit-profile", editProfile);
userRoute.post("/edit-password", editPassword);

export { userRoute };
