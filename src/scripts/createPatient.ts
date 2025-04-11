import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import creds from '../config/database';
import Patient from '../models/Patient';

dotenv.config();

async function createPatient() {
  try {
    // Create patient credentials
    const patientCredentials = {
      username: "Jagadesh Chakali",
      email: "jagjaggu@gmail.com",
      password: await bcrypt.hash("Sainath@19", 10),
      role: "PATIENT",
      userId: "PT1003",
    };

    // Create patient profile
    const patientProfile = {
      patientId: "PT1003",
      doctorId: "DOC1001",
      name: "Jagadesh Chakali",
      email: "jagjaggu@gmail.com",
      phone: "+91 9876543201",
      bloodGroup: "A+",
      gender: "Male",
      birthDate: "1 Dec 2002",
      age: 23,
      address: {
        city: "Kurnool",
        zipCode: "518002"
      },
      membership: "Active",
      joinDate: "Feb 2025",
      emergencyContacts: [
        {
          name: "Sainath",
          relation: "Friend",
          phone: "+91 9490863408",
        }
      ]
    };

    // Save credentials
    const newCredentials = new creds(patientCredentials);
    await newCredentials.save();

    // Save patient profile
    const newPatient = new Patient(patientProfile);
    await newPatient.save();

    console.log('Patient created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating patient:', error);
    process.exit(1);
  }
}

createPatient();