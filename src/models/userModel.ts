import validator from "validator";
import { model, Schema, Model, PassportLocalDocument, PassportLocalModel } from "mongoose";
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
const hashingPassword = async (entredPassword: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(entredPassword, salt);
};

const UserSchema = new Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
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
UserSchema.static("sendEmail", async (email: string, { code, expiredOn }) => {
  if (await Users.find({ email })) {
    sendingEmail(email, code);
    await Users.updateOne({ email, verificationCode: { code, expiredOn } });

    return { statusCode: 200, message: "Code has been sent successfully." };
  } else return { statusCode: 400, message: "User does not exist." };
});

// ! reset password
UserSchema.static("resetPassword", async (email: string, password: string) => {
  await Users.updateOne({ email, password: await hashingPassword(password) });
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
