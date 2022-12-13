import { Request, Response, Router } from "express";
const route = Router();

route.get("/register", (request: Request, response: Response) => response.render("register"));
route.get("/login", (request: Request, response: Response) => response.render("login"));
route.get("/", (request: Request, response: Response) => response.render("welcome"));

export { route };
