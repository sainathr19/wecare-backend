import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import creds from '../config/database';
import Patient from '../models/Patient';

dotenv.config();

async function createDoctor() {
  try {
    const doctorCredentials = {
      username: "Dr. Smith",
      email: "smith@wecare.com",
      password: await bcrypt.hash("Doctor@123", 10),
      role: "DOCTOR",
      userId: "DOC101",
    };

    const newDoctor = new creds(doctorCredentials);
    await newDoctor.save();
    console.log('Doctor credentials created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating doctor:', error);
    process.exit(1);
  }
}

createDoctor();