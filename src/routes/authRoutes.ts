import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import creds from "../config/database";
import { response } from "../utils/responseHandler";
import { User, UserRole } from "../types/user"; // Add this import
import mongoose from "mongoose";
import { SignupRequest } from "../types/schemas";

const allowedRoles = ["DOCTOR", "PATIENT", "ADMIN"] as const;

const authRouter = express.Router();

authRouter.post("/signin", async (req: Request, res: Response): Promise<void> => {
  console.log("Received request to sign in");
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      response.err(res, "Email, password, and role are required.", 400);
      return;
    }

    if (!allowedRoles.includes(role)) {
      response.err(res, "Invalid role specified.", 400);
      return;
    }
    const user = await creds.findOne({ email, role }).exec();

    if (!user || typeof user.password !== "string") {
      response.err(res, "User doesn't exist with this email and role", 400);
      return;
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      response.err(res, "Invalid Password", 401);
      return;
    }

    const secretKey = process.env.SECRET_KEY as string;
    const jwtToken = jwt.sign(
      {
        userId: user.userId, // Consistent userId for both roles
        email: user.email,
        name: user.username,
        role: user.role as UserRole,
      },
      secretKey,
      { expiresIn: "2h" }
    );

    const userData: User = {
      email: user.email,
      name: user.username,
      role: user.role as UserRole,
      userId: user.userId,
    };

    response.ok(res, {
      message: "Login successful.",
      token: jwtToken,
      user: userData,
    });
  } catch (error) {
    console.error("Signin error:", error);
    response.err(res, "Internal Server Error. Please try again later.");
  }
});

// Create Signup Request Model
const SignupRequestModel = mongoose.model<SignupRequest>(
  "SignupRequest",
  new mongoose.Schema({
    requestId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ["DOCTOR", "PATIENT"], required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  })
);

authRouter.post("/signup-request", async (req: Request, res: Response) => {
  console.log("Received request to create signup request");
  console.log("Request body:", req.body);
  try {
    const { firstName, lastName, email, phone, location, type } = req.body;

    // Generate request ID
    const lastRequest = await SignupRequestModel.findOne({
      type: type.toUpperCase(),
    }).sort({ requestId: -1 });

    // Check if a request with the same email or phone exists
    const existingRequest = await SignupRequestModel.findOne({
      $or: [{ email: email }, { phone: phone }],
      isActive: true,
    });

    if (existingRequest) {
      response.err(
        res,
        "A request with this email or phone number already exists",
        409
      );
      return;
    }

    let nextNumber = 1;
    if (lastRequest && lastRequest.requestId) {
      const lastNumber = parseInt(lastRequest.requestId.replace(/[^\d]/g, ""));
      nextNumber = lastNumber + 1;
    }

    const requestId =
      type.toUpperCase() === "DOCTOR"
        ? `DREQ${String(nextNumber).padStart(3, "0")}`
        : `PREQ${String(nextNumber).padStart(3, "0")}`;

    const signupRequest = new SignupRequestModel({
      requestId,
      firstName,
      lastName,
      email,
      phone,
      location,
      type: type.toUpperCase(),
    });

    await signupRequest.save();

    response.ok(res, {
      message: "Signup request submitted successfully",
      requestId,
    });
  } catch (error) {
    console.error("Signup request error:", error);
    response.err(res, "Failed to submit signup request");
  }
});

export default authRouter;
