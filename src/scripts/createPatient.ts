import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import creds from '../config/database';
import Patient from '../models/Patient';

dotenv.config();

async function createPatient() {
  try {
    // Create patient credentials
    const patientCredentials = {
      username: "John Smith",
      email: "john@example.com",
      password: await bcrypt.hash("Patient@123", 10),
      role: "PATIENT",
      userId: "PT1002",
    };

    // Create patient profile
    const patientProfile = {
      patientId: "PT1002",
      doctorId: "DOC101",
      name: "John Smith",
      email: "john@example.com",
      phone: "+91 9876543201",
      bloodGroup: "A+",
      gender: "Male",
      birthDate: "15 Jun 1978",
      age: 45,
      address: {
        city: "Mumbai",
        zipCode: "400001"
      },
      membership: "Active",
      joinDate: "Jan 2023",
      emergencyContacts: [
        {
          name: "Mary Smith",
          relation: "Spouse",
          phone: "+91 9876543202",
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