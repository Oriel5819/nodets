"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = void 0;
const ensureAuthenticated = (request, response, next) => {
    if (request.isAuthenticated())
        return next();
    else
        return response.send({ message: "Authentification required" });
};
exports.ensureAuthenticated = ensureAuthenticated;