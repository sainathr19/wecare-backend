import mongoose, { Schema, Document } from 'mongoose';

export interface IVitalLimits extends Document {
  patientId: string;
  doctorId: string;
  temperature: {
    min: number;
    max: number;
  };
  bloodOxygen: {
    min: number;
    max: number;
  };
  heartRate: {
    min: number;
    max: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VitalLimitsSchema = new Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  temperature: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  bloodOxygen: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  heartRate: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  }
}, {
  timestamps: true
});

// Create a compound unique index on patientId and doctorId
VitalLimitsSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

export default mongoose.model<IVitalLimits>('VitalLimits', VitalLimitsSchema);