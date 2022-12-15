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
    carry: [
      {
        id: string;
        _id: string;
        description: string;
        type: string;
        account: string;
        amount: number;
        accepted: boolean;
        date: Date;
      }
    ];
    operations: [{ id: string; description: string; type: string; account: string; amount: Number; date: Date }];
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
