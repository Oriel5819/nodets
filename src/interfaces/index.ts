export interface IUser {
  firstName: String;
  laststName: String;
  email: String;
  password: String;
  isAdmin: Boolean;
  isActivated: Boolean;
  isVerified: Boolean;
  verificationCode: {
    code: String;
    expiredOn: Date;
  };
}

export interface ICredential {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IVerification {
  email: string;
  code: string;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IResendCode {
  email: string;
}

export interface IResetPassword {
  email: string;
  resetCode: string;
  password: string;
  confirmPassword: string;
}
