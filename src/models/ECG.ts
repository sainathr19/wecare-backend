import mongoose, { Schema, Document } from 'mongoose';

export interface IECG extends Document {
  patientId: string;
  timestamp: Date;
  ecg_value: number;
}

const ECGSchema = new Schema({
  patientId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  ecg_value: { type: Number, required: true }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'patientId',
    granularity: 'seconds'
  }
});

export default mongoose.model<IECG>('ECG', ECGSchema);