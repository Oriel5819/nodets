import { Router } from "express";
import { ensureAuthenticated } from "../middleware/authentication";
import { statement, deposit, withdraw } from "../controllers/operationController";

const operationRoute = Router();

operationRoute.get("/statement", ensureAuthenticated, statement);
operationRoute.post("/deposit", ensureAuthenticated, deposit);
operationRoute.post("/withdraw", ensureAuthenticated, withdraw);

export { operationRoute };
