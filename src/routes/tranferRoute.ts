import { Router } from "express";
import { ensureAuthenticated } from "../middleware/authentication";
import { recallSent, requestSend, acceptReceive, declineReceive, requestAsk, recallAsk, declineAsk } from "../controllers/transferController";

const transferRoute = Router();

transferRoute.post("/send/:accountTargetId", ensureAuthenticated, requestSend);
transferRoute.post("/recall/:accountTargetId/:carryId", ensureAuthenticated, recallSent);
transferRoute.post("/accept/:senderId/:carryId", ensureAuthenticated, acceptReceive);
transferRoute.post("/decline/:senderId/:carryId", ensureAuthenticated, declineReceive);
// ASK
transferRoute.post("/ask/:accountTargetId", ensureAuthenticated, requestAsk);
transferRoute.post("/recall-ask/:accountTargetId/:carryId", ensureAuthenticated, recallAsk);
transferRoute.post("/accept-ask/:senderId/:carryId", ensureAuthenticated, declineAsk);
transferRoute.post("/decline-ask/:senderId/:carryId", ensureAuthenticated, declineAsk);

export { transferRoute };
