import { Router } from "express";
import { ensureAuthenticated } from "../middleware/authentication";
import { recallSent, requestSend, acceptReceive, cancelReceive, requestAskReceive, recallAskReceive, acceptAskReceive } from "../controllers/transferController";

const transferRoute = Router();

transferRoute.post("/send/:accountTargetId", ensureAuthenticated, requestSend);
transferRoute.post("/recall/:accountTargetId/:carryId", ensureAuthenticated, recallSent);
transferRoute.post("/accept/:senderId/:carryId", ensureAuthenticated, acceptReceive);
transferRoute.post("/decline/:senderId/:carryId", ensureAuthenticated, cancelReceive);

transferRoute.post("/ask/:accountTargetId", ensureAuthenticated, requestAskReceive);
transferRoute.post("/recall-ask/:accountTargetId/:carryId", ensureAuthenticated, recallAskReceive);
transferRoute.post("/accept-ask/:senderId/:carryId", ensureAuthenticated, acceptAskReceive);

export { transferRoute };
