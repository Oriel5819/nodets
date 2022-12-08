import { Router } from "express";

const operationRoute = Router();

operationRoute.get("/balance", () => {});

operationRoute.post("/topup", () => {});
operationRoute.post("/withdraw", () => {});

operationRoute.post("/send-request", () => {});
operationRoute.post("/send-accept", () => {});
operationRoute.post("/receive-request", () => {});
operationRoute.post("/receive-accept", () => {});

export { operationRoute };
