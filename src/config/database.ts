import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const connection = mongoose.createConnection(process.env.MONGO_URI as string);

connection.on("error", (err) => {
  console.log("Error Connecting to Database");
});

connection.on("connected", function () {
  console.log("Connection successfull");
});

connection.on("disconnected", function () {
  console.log("Connection Lost");
});

const authdb = connection.useDb("auth");

const CredentialSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const credentials = authdb.model("credentials", CredentialSchema);

export default credentials;
