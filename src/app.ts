import express, { Application, Request, Response } from "express";
import { join } from "path";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { MONGO_URI, PORT } from "./config/constant";
import { mongodbConnect } from "./database/mongodbConnect";
import mongoStore from "connect-mongo";
import consola from "consola";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport";

import { authRoute } from "./routes/authRoute";
import { userRoute } from "./routes/userRoute";
import { operationRoute } from "./routes/operationRoute";
import { transferRoute } from "./routes/tranferRoute";
import { accountStatusRoute } from "./routes/accountStatusRoute";

const port: number | String = PORT ?? 5050;
const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("tiny"));

// STATIC
app.use(express.static(join(__dirname, "../", "public")));

// EJS
// app.use(expressLayout);
app.set("view engine", "ejs");

// CONNECT TO MONGODB
mongodbConnect(MONGO_URI ?? "");

// SESSION
app.use(session({ secret: "mysecret", resave: true, saveUninitialized: true, store: mongoStore.create({ mongoUrl: MONGO_URI }) }));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
// passport.use(Users.createStrategy());

// ROUTES
// app.use("/", (request: Request, response: Response) => response.render("index"));
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/operations", operationRoute);
app.use("/api/v1/transfers", transferRoute);
app.use("/api/v1/accounts", accountStatusRoute);

app.all("*", (request: Request, response: Response) => response.status(400).send({ message: "404 Not found." }));

app.listen(port, () => consola.success({ badge: true, message: "Running in port", port }));
