import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import creds from '../config/database';

dotenv.config();

async function createDummyUser() {
  try {
    const dummyUser = {
      username: "Sainath",
      email: "gsnr1925@gmail.com",
      password: await bcrypt.hash("Sainath@19", 10),
      role: "PATIENT"  ,
      userId: "PAT1001",
    };

    const newUser = new creds(dummyUser);
    await newUser.save();
    console.log('Dummy user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating dummy user:', error);
    process.exit(1);
  }
}

createDummyUser();