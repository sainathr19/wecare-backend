import mongoose, { Schema, Document } from 'mongoose';

export interface IBiometric extends Document {
  patientId: string;
  timestamp: string;
  heartRate: number;
  oxygen: number;
  temperature: number;
  createdAt: Date;
  updatedAt: Date;
}

const BiometricSchema = new Schema({
  patientId: { type: String, required: true },
  timestamp: { type: String, required: true },
  heartRate: { type: Number, required: true },
  oxygen: { type: Number, required: true },
  temperature: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IBiometric>('Biometric', BiometricSchema);