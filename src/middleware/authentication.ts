import { Request, Response, NextFunction } from "express";

const ensureAuthenticated = (request: Request, response: Response, next: NextFunction) => {
  if (request.isAuthenticated()) return next();
  else return response.status(401).send({ message: "Authentification required" });
};

export { ensureAuthenticated };
