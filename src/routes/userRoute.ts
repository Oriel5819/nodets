import { Request, Response, Router } from "express";
import passport from "passport";
import { ensureAuthenticated } from "../middleware/authentication";
import { profile, editProfile, editPassword } from "../controllers/userController";

const userRoute = Router();

userRoute.get("/me", ensureAuthenticated, profile);
userRoute.patch("/edit-profile", ensureAuthenticated, editProfile);
userRoute.patch("/edit-password", ensureAuthenticated, editPassword);

userRoute.all("*", (request: Request, response: Response) => response.status(404).send({ message: "404 Not Found" }));

export { userRoute };
