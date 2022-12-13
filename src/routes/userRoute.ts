import { Request, Response, Router } from "express";
import passport from "passport";
import { ensureAuthenticated } from "../middleware/authentication";
import { welcome, register, verifyCode, resendCode, resetPassword, login, profile, editProfile, editPassword } from "../controllers/userController";

const userRoute = Router();

userRoute.get("/verify-code", (request: Request, response: Response) => response.send("Verify-code"));
userRoute.get("/resend-code", (request: Request, response: Response) => response.send("Resend-code"));
userRoute.get("/reset-password", (request: Request, response: Response) => response.send("Reset-password"));
userRoute.get("/edit-password", (request: Request, response: Response) => response.send("Edit-password"));

userRoute.get("/me", (request: Request, response: Response) => response.send("My profile"));
userRoute.get("/edit-profile", (request: Request, response: Response) => response.send("Edit-profile"));

// userRoute.get("/", welcome);
// userRoute.get("/me", ensureAuthenticated, profile);
// userRoute.post("/register", register);
// userRoute.post("/verify-code", verifyCode);
// userRoute.post("/resend-code", resendCode);
// userRoute.post("/reset-password", resetPassword);
// userRoute.post("/login", passport.authenticate("local"), login);
// // userRoute.get("/logout", ensureAuthenticated, logout);
// userRoute.post("/edit-profile", editProfile);
// userRoute.post("/edit-password", editPassword);

export { userRoute };
