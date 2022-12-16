export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isTeller: boolean;
  isActivated: boolean;
  isVerified: boolean;
  verificationCode: {
    code: string;
    expiredOn: Date;
  };
  balance: {
    current: number;
    carry: [ICarry];
    operations: [IOperation];
  };
}

export interface IOperation {
  id: string;
  description: string;
  type: string;
  account: string;
  amount: number;
  isAccepted: Boolean;
  isRejected: Boolean;
  isRecalled: Boolean;
  date: Date;
}

export interface ICarry {
  id: string;
  description: string;
  type: string;
  account: string;
  amount: number;
  isAccepted: Boolean;
  isRejected: Boolean;
  isRecalled: Boolean;
  sentDate: Date;
  acceptedDate: Date | null;
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
