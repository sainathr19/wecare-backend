import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  patientId: string;
  doctorId: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  gender: string;
  birthDate: string;
  age: number;
  address: {
    city: string;
    zipCode: string;
  };
  membership: string;
  joinDate: string;
  emergencyContacts: Array<{
    name: string;
    relation: string;
    phone: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema({
  patientId: { type: String, required: true, unique: true },
  doctorId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  gender: { type: String, required: true },
  birthDate: { type: String, required: true },
  age: { type: Number, required: true },
  address: {
    city: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  membership: { type: String, required: true },
  joinDate: { type: String, required: true },
  emergencyContacts: [{
    name: { type: String, required: true },
    relation: { type: String, required: true },
    phone: { type: String, required: true }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IPatient>('Patient', PatientSchema);