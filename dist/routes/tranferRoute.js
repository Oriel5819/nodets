"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferRoute = void 0;
const express_1 = require("express");
const authentication_1 = require("../middleware/authentication");
const transferController_1 = require("../controllers/transferController");
const transferRoute = (0, express_1.Router)();
exports.transferRoute = transferRoute;
transferRoute.post("/send/:accountTargetId", authentication_1.ensureAuthenticated, transferController_1.requestSend);
transferRoute.post("/recall/:accountTargetId/:carryId", authentication_1.ensureAuthenticated, transferController_1.recallSent);
transferRoute.post("/accept/:senderId/:carryId", authentication_1.ensureAuthenticated, transferController_1.acceptReceive);
transferRoute.post("/decline/:senderId/:carryId", authentication_1.ensureAuthenticated, transferController_1.declineReceive);
// ASK
transferRoute.post("/ask/:accountTargetId", authentication_1.ensureAuthenticated, transferController_1.requestAsk);
transferRoute.post("/recall-ask/:accountTargetId/:carryId", authentication_1.ensureAuthenticated, transferController_1.recallAsk);
transferRoute.post("/accept-ask/:senderId/:carryId", authentication_1.ensureAuthenticated, transferController_1.declineAsk);
transferRoute.post("/decline-ask/:senderId/:carryId", authentication_1.ensureAuthenticated, transferController_1.declineAsk);
