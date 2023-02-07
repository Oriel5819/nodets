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
import passport from "passport";
import "./config/passport";

import { authRoute } from "./routes/authRoute";
import { userRoute } from "./routes/userRoute";
import { operationRoute } from "./routes/operationRoute";
import { transferRoute } from "./routes/tranferRoute";
import { accountStatusRoute } from "./routes/accountStatusRoute";

import { errorHandler } from "./middleware/errorHandler";

const port: number | String = PORT ?? 5050;
const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3050", credentials: true }));
app.use(helmet());
app.use(morgan("tiny"));

// STATIC
app.use(express.static(join(__dirname, "../", "public")));

// EJS
// app.use(expressLayout);
app.set("view engine", "ejs");

// SESSION
app.use(session({ 
    secret: "mysecret", 
    resave: true, 
    saveUninitialized: true, 
    store: mongoStore.create({ 
        mongoUrl: MONGO_URI, 
        collectionName: 'sessions' 
    }), 
    cookie: { maxAge: 3600 * 1000 }
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
// passport.use(Users.createStrategy());

// ROUTES
app.get("/", (request: Request, response: Response) => response.status(200).send("welcome to fvola api v1.0.0"));
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/operations", operationRoute);
app.use("/api/v1/transfers", transferRoute);
app.use("/api/v1/accounts", accountStatusRoute);

app.all("*", (request: Request, response: Response) => response.status(400).send({ message: "404 Not found." }));

// HANDLE ERROR
app.use(errorHandler);

app.listen(port, () => {
    mongodbConnect(MONGO_URI ?? "");
    consola.success({ badge: true, message: "Running in port", port });
});
