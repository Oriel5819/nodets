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
const consola_1 = __importDefault(require("consola"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
require("./strategies/local");
const userRoute_1 = require("./routes/userRoute");
const operationRoute_1 = require("./routes/operationRoute");
const accountStatusRoute_1 = require("./routes/accountStatusRoute");
const port = constant_1.PORT !== null && constant_1.PORT !== void 0 ? constant_1.PORT : 5050;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({ origin: "http://localhost:3000", credentials: true }));
app.use((0, express_session_1.default)({ secret: "mysecret", resave: true, saveUninitialized: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("tiny"));
// STATIC
app.use(express_1.default.static((0, path_1.join)(__dirname, "../", "public")));
// EJS
// app.use(expressLayout);
app.set("view engine", "ejs");
// CONNECT TO MONGODB
(0, mongodbConnect_1.mongodbConnect)(constant_1.MONGO_URI !== null && constant_1.MONGO_URI !== void 0 ? constant_1.MONGO_URI : "");
// PASSPORT
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// passport.use(Users.createStrategy());
// ROUTES
// app.use("/", (request: Request, response: Response) => response.render("index"));
app.use("/users", userRoute_1.userRoute);
app.use("/operations", operationRoute_1.operationRoute);
app.use("/accounts", accountStatusRoute_1.accountStatusRoute);
app.listen(port, () => consola_1.default.success({ badge: true, message: "Running in port", port }));
