import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { registerService, verificationService, resendCodeService, resetPasswordService } from "../services/authService";

const register = async (request: Request, response: Response) => {
	const { email, password, confirmPassword } = request.body;
	const { statusCode, message } = await registerService({
		email,
		password,
		confirmPassword,
	});
	response.status(statusCode).send({ message });
};

const verifyCode = async (request: Request, response: Response) => {
	const { email, code } = request.body;
	const { statusCode, message } = await verificationService({ email, code });
	response.status(statusCode).send({ message });
};

const resendCode = async (request: Request, response: Response) => {
	const { email } = request.body;
	const { statusCode, message } = await resendCodeService({ email });
	response.status(statusCode).send({ message });
};

const resetPassword = async (request: Request, response: Response) => {
	const { email, resetCode, password, confirmPassword } = request.body;
	const { statusCode, message } = await resetPasswordService({
		email,
		resetCode,
		password,
		confirmPassword,
	});
	response.status(statusCode).send({ message });
};

const login = (request: Request, response: Response, next: NextFunction) =>
passport.authenticate("local", function (error, user, info) {
	if (error) return next(error);
	if (!user) return response.send({ message: info.message });

	request.logIn(user, (error) => {
		if (error) next(error);

		response.status(200).send({
			firstName: user.firstName,
			lastName: user.lastName,
			balance: user.balance.current,
			email: user.email,
			isActivated: user.isActivated,
			isVerified: user.isVerified,
			isAdmin: user.isAdmin,
			isTeller: user.isTeller,
		});
	});
})(request, response, next);

const logout = async (request: Request, response: Response, next: NextFunction) =>
	request.logout((error) => {
		if (error) return next(error);

		response.status(200).send({ message: "Logged out" });
	});

export { register, verifyCode, resendCode, resetPassword, login, logout };
