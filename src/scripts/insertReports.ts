import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from '../models/Report';
import Patient from '../models/Patient';

dotenv.config();

async function insertReport(patientId: string, temperature: number, sp02: number, bloodOxygen: number, source: string, heartRate: number, timestamp: Date) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const patient = await Patient.findOne({ patientId });
    if (!patient) {
      throw new Error(`Patient with ID ${patientId} not found`);
    }

    const report = new Report({
      reportId: `REP${Date.now()}`,
      patientId,
      doctorId: patient.doctorId,
      timestamp: timestamp.toISOString(), // Use the passed timestamp
      source,
      status: 'Normal',
      type: 'Remote Checkup',
      isViewed: false,
      temperature,
      sp02,
      bloodOxygen,
      heartRate
    });

    await report.save();
    console.log('Report created successfully for date:', timestamp.toISOString());
  } catch (error) {
    console.error('Error creating report:', error);
  } finally {
    await mongoose.disconnect();
  }
}

async function main() {
  try {
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(Math.floor(Math.random() * 12) + 8, 0, 0); // Random hour between 8 AM and 8 PM

      await insertReport(
        'PT1003',
        97 + Math.random() * 2,
        95 + Math.floor(Math.random() * 4),
        95 + Math.floor(Math.random() * 4),
        'Wecare V0',
        70 + Math.floor(Math.random() * 20),
        date // Pass the date to the function
      );
    }
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main();