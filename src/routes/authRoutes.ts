import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import creds from "../config/database";
import validatePassword from "../utils/passwordUtility";

const authRouter = express.Router();

authRouter.post(
  "/signup",
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          status: "error",
          message: "Username and password are required.",
        });
        return;
      }

      if (!validatePassword(password)) {
        res.status(400).json({
          status: "error",
          message:
            "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
        });
        return;
      }

      const existingUser = await creds.findOne({ username });
      if (existingUser) {
        res
          .status(409)
          .json({ status: "error", message: "Username already exists." });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new creds({
        username: username,
        password: hashedPassword,
      });

      newUser.save();

      res
        .status(201)
        .json({ status: "success", message: "User registered successfully." });
      return;
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error. Please try again later.",
      });
      return;
    }
  }
);

authRouter.post(
  "/signin",
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || typeof password !== "string") {
        res.status(400).json({
          status: "error",
          message: "Username and password are required.",
        });
        return;
      }

      const user = await creds.findOne({ username }).exec();

      if (!user || typeof user.password !== "string") {
        res.status(400).json({
          status: "error",
          message: "User doesn't exist",
        });
        return;
      }

      const isPasswordMatched = await bcrypt.compare(password, user.password);

      if (!isPasswordMatched) {
        res.status(401).send("Invalid Password");
        return;
      }

      const secretKey = process.env.SECRET_KEY as string;

      const jwtToken = jwt.sign({ username }, secretKey, {
        expiresIn: "2h",
      });

      const cookieExpiry = 60 * 60 * 60 * 1000;
      res.cookie("authToken", jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: cookieExpiry,
        path: "/",
      });
      res.status(200).json({
        status: "success",
        message: "Login successful.",
        token: jwtToken,
      });
      return;
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error. Please try again later.",
      });
      return;
    }
  }
);

export default authRouter;
