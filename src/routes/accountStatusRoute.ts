import { Router } from "express";

const accountStatusRoute = Router();

accountStatusRoute.post("/active", () => {});
accountStatusRoute.post("/desactive", () => {});
accountStatusRoute.post("/delete", () => {});

export { accountStatusRoute };
