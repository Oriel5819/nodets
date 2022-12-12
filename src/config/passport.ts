import { Request, Response } from "express";
import passport from "passport";
import { Strategy } from "passport-local";
import { Users } from "../models/userModel";
import { loginService } from "../services/authService";

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  console.log(await Users.findById(id));
});

passport.use(
  new Strategy({ usernameField: "email" }, async (email, password, done) => {
    return done(null, await loginService({ email, password }));
  })
);
