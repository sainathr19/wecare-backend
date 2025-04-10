import { ObjectId } from "mongodb";

// Base interface for common fields
interface BaseSchema {
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Patient extends BaseSchema {
  _id: ObjectId;
  patientId: string;
  name: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  bloodGroup: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;  // Added country
  };
  medicalHistory: {
    conditions: Array<{
      name: string;
      diagnosedDate: Date;
      status: "Active" | "Resolved";
    }>;
    allergies: Array<{
      name: string;
      severity: "Mild" | "Moderate" | "Severe";
    }>;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: Date;
      endDate?: Date;
    }>;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    alternatePhone?: string;  // Added alternate contact
  };
}

export interface Doctor extends BaseSchema {
  _id: ObjectId;
  doctorId: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];  // Changed to array for multiple specializations
  qualification: string[];
  experience: number;
  availability: {
    days: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday")[];
    timeSlots: Array<{
      start: string;
      end: string;
      maxPatients: number;  // Added capacity limit
    }>;
  };
  rating: {
    average: number;
    count: number;
  };
  fees: {
    consultation: number;
    followUp: number;
  };
  languages: string[];  // Added supported languages
}

export interface Appointment extends BaseSchema {
  _id: ObjectId;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  dateTime: Date;
  status: "Scheduled" | "Completed" | "Cancelled" | "No-Show";
  type: "Regular Checkup" | "Follow-up" | "Emergency" | "Consultation";
  symptoms: string[];
  notes: string;
  prescription?: {
    medications: Array<{
      name: string;
      dosage: string;
      duration: string;
      frequency: string;  // Added frequency
      instructions: string;
      warnings?: string[];  // Added warnings
    }>;
    additionalNotes: string;
    followUpDate?: Date;  // Added follow-up date
  };
  paymentStatus: "Pending" | "Completed" | "Refunded";  // Added payment tracking
  cancellationReason?: string;
}

export interface AppointmentStats extends BaseSchema {
  _id: ObjectId;
  doctorId: string;
  date: Date;
  inPersonVisits: number;
  remoteCheckups: number;
  missedCheckups: number;
}

export interface SignupRequest extends BaseSchema {
  _id: ObjectId;
  requestId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  type: "DOCTOR" | "PATIENT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes?: string;
}