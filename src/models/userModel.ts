import validator from "validator";
import mongoose, { model, Schema, Model, PassportLocalDocument, PassportLocalModel } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import bcrypt from "bcrypt";
import { transporter } from "../middleware/sendEmail";
import { IUser } from "../interfaces";

interface IUserModel extends Model<IUser> {
  sendEmail(email: string, verificationCode: { code: string; expiredOn: Date }): { statusCode: number; message: string };
  resetPassword(email: string, password: string): { statusCode: number; message: string };
}

// SEND EMAIL
const sendingEmail = (email: string, code: string) => {
  // sending verification email
  let mailOptions = {
    from: `" FVola" <orielvillam@gmail.com>`,
    to: email,
    subject: `FVola --account verification email--`,
    html: `<h2>Thanks for registering on FVola<h2>
            <h4>Please use this code to verify your accountt.<h4>
            <h4 style="padding: 10px; background-color: purple; color: white">${code}</h4>
            <h4>This code will be expired in three (3) minutes<h4>`,
  };
  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if (error) {
      throw new Error("Error occured while sending verification email");
      // console.log(error);
    } else {
      console.log(`Verification email has been sent to ${email}`);
      // console.log(info);
      // callback();
    }
  });
};

// ! hashing password
export const hashingPassword = async (entredPassword: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(entredPassword, salt);
};

export const comparePassword = async (enteredPassword: string, passwordToCompareWith: string) => {
  return await bcrypt.compare(enteredPassword, passwordToCompareWith);
};

const UserSchema = new Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    address: { type: String, trim: true },
    balance: {
      current: { type: Number, trim: true, default: 10000 },
      carry: [
        {
          id: { type: String, trim: true },
          description: { type: String, trim: true },
          type: { type: String, trim: true },
          account: { type: mongoose.Types.ObjectId },
          amount: { type: Number, trim: true },
          accepted: { type: Boolean, trim: true, default: false },
          date: { type: Date, trim: true },
        },
      ],
      operations: [
        {
          id: { type: String, trim: true },
          description: { type: String, trim: true },
          type: { type: String, trim: true },
          account: {
            type: mongoose.Types.ObjectId,
            trim: true,
          },
          amount: { type: Number, trim: true },
          date: { type: Date, trim: true },
        },
      ],
    },
    email: {
      type: String,
      trim: true,
      require: true,
      unique: true,
      lowercase: true,
      validator(value: string) {
        if (!validator.isEmail(value)) throw new Error("Invalid email");
      },
    },
    password: {
      type: String,
      trim: true,
      require: true,
      minlength: 8,
      validator(value: string) {
        if (value.toLowerCase().includes("password")) throw new Error("Password cannot contain the word 'password'");
      },
    },
    isAdmin: { type: Boolean, default: false },
    isTeller: { type: Boolean, default: false },
    isActivated: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationCode: {
      code: { type: String, trim: true },
      expiredOn: { type: Date, trim: true, default: Date.now },
    },
  },
  { timestamps: true }
);

// ! send email
UserSchema.static("sendEmail", async (email: string, { code }) => sendingEmail(email, code));

// ! reset password
UserSchema.static("resetPassword", async (email: string, password: string) => {
  await Users.findOneAndUpdate({ email, isVerified: true }, { password: await hashingPassword(password), verificationCode: null });
  return { statusCode: 200, message: "Password reset" };
});

// ! after saving a user
UserSchema.pre("save", async function (next) {
  try {
    // if the password has not modified
    if (!this.isModified("password")) {
      next();
    }

    this.password = await hashingPassword(this.password ?? "");
    next();
  } catch (error: any) {
    next(error);
  }
});

// ! after saving a user
UserSchema.post("save", async function (doc, next) {
  try {
    sendingEmail(this.email!, this.verificationCode?.code!);
    next();
  } catch (error: any) {
    next(error);
  }
});

// UserSchema.plugin(passportLocalMongoose);

export const Users = model<IUser, IUserModel>("User", UserSchema);
