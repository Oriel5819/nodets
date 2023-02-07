"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const constant_1 = require("./config/constant");
const mongodbConnect_1 = require("./database/mongodbConnect");
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const consola_1 = __importDefault(require("consola"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
require("./config/passport");
const authRoute_1 = require("./routes/authRoute");
const userRoute_1 = require("./routes/userRoute");
const operationRoute_1 = require("./routes/operationRoute");
const tranferRoute_1 = require("./routes/tranferRoute");
const accountStatusRoute_1 = require("./routes/accountStatusRoute");
const errorHandler_1 = require("./middleware/errorHandler");
const port = constant_1.PORT !== null && constant_1.PORT !== void 0 ? constant_1.PORT : 5050;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: "http://localhost:3050", credentials: true }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("tiny"));
// STATIC
app.use(express_1.default.static((0, path_1.join)(__dirname, "../", "public")));
// EJS
// app.use(expressLayout);
app.set("view engine", "ejs");
// SESSION
app.use((0, express_session_1.default)({
    secret: "mysecret",
    resave: true,
    saveUninitialized: true,
    store: connect_mongo_1.default.create({
        mongoUrl: constant_1.MONGO_URI,
        collectionName: 'sessions'
    }),
    cookie: { maxAge: 3600 * 1000 }
}));
// PASSPORT
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// passport.use(Users.createStrategy());
// ROUTES
app.get("/", (request, response) => response.status(200).send("welcome to fvola api v1.0.0"));
app.use("/api/v1/auth", authRoute_1.authRoute);
app.use("/api/v1/users", userRoute_1.userRoute);
app.use("/api/v1/operations", operationRoute_1.operationRoute);
app.use("/api/v1/transfers", tranferRoute_1.transferRoute);
app.use("/api/v1/accounts", accountStatusRoute_1.accountStatusRoute);
app.all("*", (request, response) => response.status(400).send({ message: "404 Not found." }));
// HANDLE ERROR
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    (0, mongodbConnect_1.mongodbConnect)(constant_1.MONGO_URI !== null && constant_1.MONGO_URI !== void 0 ? constant_1.MONGO_URI : "");
    consola_1.default.success({ badge: true, message: "Running in port", port });
});
