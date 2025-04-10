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
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema({
  reportId: { type: String, required: true, unique: true },
  measurement: { type: String, required: true },
  timestamp: { type: String, required: true },
  source: { type: String, required: true },
  status: { type: String, required: true },
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  type: { type: String, required: true },
  isViewed: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model<IReport>('Report', ReportSchema);