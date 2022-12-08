import express, { Application, Request, Response } from "express";
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

import { userRoute } from "./routes/userRoute";
import { operationRoute } from "./routes/operationRoute";
import { accountStatusRoute } from "./routes/accountStatusRoute";

const port: number | String = PORT ?? 5050;
const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(session({ secret: "mysecret", resave: true, saveUninitialized: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());
app.use(morgan("tiny"));

// STATIC
app.use(express.static(join(__dirname, "../", "public")));

// EJS
// app.use(expressLayout);
app.set("view engine", "ejs");

// CONNECT TO MONGODB
mongodbConnect(MONGO_URI ?? "");

// ROUTES
app.use("/", (request: Request, response: Response) => response.render("index"));
app.use("/users", userRoute);
app.use("/operations", operationRoute);
app.use("/accounts", accountStatusRoute);

app.listen(port, () => consola.success({ badge: true, message: "Running in port", port }));
