import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reportId: string;
  measurement: string;
  timestamp: string;
  source: string;
  status: string;
  patientId: string;
  doctorId: string;
  type: string;
  isViewed: boolean;
  temperature: number;
  bloodOxygen: number;
  heartRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema({
  reportId: { type: String, required: true, unique: true },
  timestamp: { type: String, required: true },
  source: { type: String, required: true },
  status: { type: String, required: true },
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  type: { type: String, required: true },
  isViewed: { type: Boolean, default: false },
  temperature: { type: String },
  bloodOxygen: { type: Number, required: true },
  heartRate: { type: Number, required: true },
}, {
  timestamps: true
});

export default mongoose.model<IReport>('Report', ReportSchema);