import { Router } from "express";
import { ensureAuthenticated } from "../middleware/authentication";
import { statement, deposit, withdraw } from "../controllers/operationController";

const operationRoute = Router();

operationRoute.get("/statement", ensureAuthenticated, statement);
operationRoute.post("/deposit/:accountTargetId", ensureAuthenticated, deposit);
operationRoute.post("/withdraw/:accountTargetId", ensureAuthenticated, withdraw);

export { operationRoute };
