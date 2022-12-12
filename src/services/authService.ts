import { ICredential, ILogin, IResendCode, IResetPassword, IVerification } from "../interfaces";
import { comparePassword, Users } from "../models/userModel";

const registerService = async ({ email, password, confirmPassword }: ICredential): Promise<{ statusCode: number; message: string }> => {
  if (!email) return { statusCode: 400, message: "Email is required" };
  if (!password) return { statusCode: 400, message: "Password is required" };
  if (!confirmPassword) return { statusCode: 400, message: "Password is required" };

  if ([email, password, confirmPassword].every(Boolean)) {
    if (await Users.findOne({ email })) return { statusCode: 400, message: "User already exists" };
  }

  await new Users({
    email,
    password,
    verificationCode: {
      code: Math.floor(10000000 + Math.random() * 99999999).toString(),
      expiredOn: new Date(Date.now() + 1000 * 60 * 3),
    },
  })
    .save()
    .then(() => console.log("User has been registered"));
  return { statusCode: 201, message: "Registered" };
};

const resendCodeService = async ({ email }: IResendCode): Promise<{ statusCode: number; message: string }> => {
  const verificationCode = {
    code: Math.floor(10000000 + Math.random() * 99999999).toString(),
    expiredOn: new Date(Date.now() + 1000 * 60 * 3),
  };

  if (!email) return { statusCode: 400, message: "Email is required" };
  const { statusCode, message } = await Users.sendEmail(email, verificationCode);

  return { statusCode, message };
};

const verificationService = async ({ email, code }: IVerification): Promise<{ statusCode: number; message: string }> => {
  if (!email) return { statusCode: 400, message: "Email is required" };
  if (!code) return { statusCode: 400, message: "The verification code is required" };
  if (await Users.findOne({ email, isVerified: true })) return { statusCode: 401, message: "Account already verified" };

  const foundUser = await Users.findOne({ email, isVerified: false });

  if (!foundUser) return { statusCode: 400, message: "Invalid Email" };

  if (foundUser?.verificationCode?.code !== code) {
    return { statusCode: 400, message: "Invalid code" };
  }

  const expireTime = Math.floor(new Date(foundUser?.verificationCode?.expiredOn).getTime());

  if (expireTime < Date.now()) return { statusCode: 400, message: "Expired code" };

  await Users.updateOne({ email, verificationCode: null, isVerified: true });
  return { statusCode: 200, message: "Account has been verified" };
};

const resetPasswordService = async ({ email, resetCode, password, confirmPassword }: IResetPassword): Promise<{ statusCode: number; message: string }> => {
  if (!email) return { statusCode: 400, message: "Email is required" };
  if (!resetCode) return { statusCode: 400, message: "ResetCode is required" };
  if (!password) return { statusCode: 400, message: "Password is required" };
  if (!confirmPassword) return { statusCode: 400, message: "Password is required" };
  if (await Users.findOne({ email, isVerified: false })) return { statusCode: 400, message: "Unverified account" };

  const foundUser = await Users.findOne({ email, isVerified: true });

  if (foundUser && foundUser.verificationCode.code === resetCode && password === confirmPassword) {
    const { statusCode, message } = await Users.resetPassword(email, password);
    return { statusCode, message };
  } else return { statusCode: 400, message: "Error occured while resetting password" };
};

const loginService = async ({ email, password }: ILogin) => {
  let foundUser = await Users.findOne({ email, isVerified: true, verificationCode: null });

  if (foundUser && (await comparePassword(password, foundUser.password as string))) return foundUser;
  else return null;
};

const logoutService = async () => {};

export { registerService, verificationService, resendCodeService, resetPasswordService, loginService, logoutService };
