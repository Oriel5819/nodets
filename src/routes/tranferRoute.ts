import { Router } from "express";
import { ensureAuthenticated } from "../middleware/authentication";
import { recallSent, requestSend } from "../controllers/transferController";

const transferRoute = Router();

transferRoute.post("/request-send/:accountTargetId", ensureAuthenticated, requestSend);
transferRoute.post("/recall-sent/:accountTargetId/:carryId", ensureAuthenticated, recallSent);
transferRoute.post("/request-receive", ensureAuthenticated, () => {});
transferRoute.post("/accept-received", ensureAuthenticated, () => {});

export { transferRoute };
