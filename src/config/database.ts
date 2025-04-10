import mongoose, { Document } from "mongoose";
import { UserRole } from "../types/user";
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Add connection error handling
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Add customId to the interface
interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  userId: string;
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  userId: { type: String, required: true, unique: true }
});

const creds = mongoose.model<IUser>("User", userSchema);

export default creds;
