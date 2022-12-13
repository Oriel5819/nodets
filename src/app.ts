import express, { Application, NextFunction, Request, Response } from "express";
import { join } from "path";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import expressLayout from "express-ejs-layouts";
import { MONGO_URI, PORT } from "./config/constant";
import { mongodbConnect } from "./database/mongodbConnect";
import consola from "consola";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport";

import { route } from "./routes";
import { userRoute } from "./routes/userRoute";
import { operationRoute } from "./routes/operationRoute";
import { accountStatusRoute } from "./routes/accountStatusRoute";

const port: number | String = PORT ?? 5050;
const app: Application = express();

app.use(function (request: Request, response: Response, next: NextFunction) {
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css; frame-src 'self'"
  );
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("tiny"));

// STATIC
app.use(express.static(join(__dirname, "../", "public")));

// EJS
app.use(expressLayout);
app.set("view engine", "ejs");

// CONNECT TO MONGODB
mongodbConnect(MONGO_URI ?? "");

// SESSION
app.use(session({ secret: "mysecret", resave: true, saveUninitialized: true }));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
// passport.use(Users.createStrategy());

// FORNT ROUTES
app.use("/", route);

// BACK ROUTES
app.use("/users", userRoute);
app.use("/operations", operationRoute);
app.use("/accounts", accountStatusRoute);

app.listen(port, () => consola.success({ badge: true, message: "Running in port", port }));
