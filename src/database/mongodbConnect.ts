import mongoose from "mongoose";
import consola from "consola";

export const mongodbConnect = (mongo_uri: string) => {
  mongoose
    .set("strictQuery", true)
    .connect(mongo_uri)
    .then(() => consola.success({ badge: true, message: "Connected to Mongodb" }))
    .catch(() => consola.error({ badge: true, message: "Cannot connect to Mongodb" }));
};
