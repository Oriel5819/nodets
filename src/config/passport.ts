import { Request, Response } from "express";
import passport from "passport";
import { Strategy } from "passport-local";
import { comparePassword, Users } from "../models/userModel";

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const foundUser = await Users.findById(id);
    if (foundUser) done(null, foundUser.email);
    else done(null, false);
  } catch (error) {
    done(error, false);
  }
});

passport.use(
  new Strategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const foundUser = await Users.findOne({ email });
      if (!foundUser) return done(null, false, { message: "Invalid email" });
      if (!foundUser?.isVerified) return done(null, false, { message: "Unverified user" });
      if (!(await comparePassword(password, foundUser?.password as string))) done(null, false, { message: "Wrong password" });
      done(null, foundUser);
    } catch (error) {
      done(error, null);
    }
  })
);
