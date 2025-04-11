import express, { Request, Response } from "express";
import { response } from "../utils/responseHandler";
import { verifyToken } from "../middlewares/auth";
import Patient from "../models/Patient";
import Report from "../models/Report";
import Biometric from "../models/Biometric";
import ECG from "../models/ECG";

const patientRouter = express.Router();

// Get patient profile
patientRouter.get("/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const requestedPatientId = req.query.patientId as string;
    const tokenUser = (req as any).user;

    if (!requestedPatientId) {
      response.err(res, "Patient ID is required", 400);
      return;
    }

    // Allow doctors to access any patient's profile
    if (tokenUser.role === "DOCTOR") {
      const patientProfile = await Patient.findOne({ patientId: requestedPatientId });
      if (patientProfile) {
        response.ok(res, patientProfile);
      } else {
        response.err(res, "Patient not found", 404);
      }
      return;
    }

    // For patients, verify they can only access their own profile
    if (tokenUser.role === "PATIENT" && requestedPatientId !== tokenUser.userId) {
      response.err(res, "Unauthorized access", 403);
      return;
    }

    const patientProfile = await Patient.findOne({ patientId: requestedPatientId });
    if (patientProfile) {
      response.ok(res, patientProfile);
    } else {
      response.err(res, "Patient not found", 404);
    }
  } catch (error) {
    response.err(res, "Error fetching profile");
  }
});

// Get patient reports
patientRouter.get("/reports", verifyToken, async (req: Request, res: Response) => {
  try {
    const requestedPatientId = req.query.patientId as string;
    const tokenUser = (req as any).user;

    if (!requestedPatientId) {
      response.err(res, "Patient ID is required", 400);
      return;
    }

    // Allow doctors to access any patient's reports
    if (tokenUser.role === "DOCTOR") {
      const patientReports = await Report.find({ patientId: requestedPatientId });
      response.ok(res, {
        reports: patientReports,
        total: patientReports.length
      });
      return;
    }

    // For patients, verify they can only access their own reports
    if (tokenUser.role === "PATIENT" && requestedPatientId !== tokenUser.userId) {
      response.err(res, "Unauthorized access", 403);
      return;
    }

    const patientReports = await Report.find({ patientId: requestedPatientId });
    response.ok(res, {
      reports: patientReports,
      total: patientReports.length
    });
  } catch (error) {
    response.err(res, "Error fetching reports");
  }
});

// Get single report
patientRouter.get("/reports/:reportId", verifyToken, async (req: Request, res: Response) => {
  try {
    const reportId = req.params.reportId;
    const tokenUser = (req as any).user;

    const report = await Report.findOne({ reportId });

    if (!report) {
      response.err(res, "Report not found", 404);
      return;
    }

    // For doctors, allow access to any report
    if (tokenUser.role === "DOCTOR") {
      response.ok(res, report);
      return;
    }

    // For patients, verify they can only access their own reports
    if (tokenUser.role === "PATIENT" && report.patientId !== tokenUser.userId) {
      response.err(res, "Unauthorized access", 403);
      return;
    }

    response.ok(res, report);
  } catch (error) {
    response.err(res, "Error fetching report");
  }
});

// // Get biometric data
// patientRouter.get("/biometrics", verifyToken, async (req: Request, res: Response) => {
//   try {
//     const requestedPatientId = req.query.patientId as string;
//     const tokenUser = (req as any).user;

//     if (!requestedPatientId) {
//       response.err(res, "Patient ID is required", 400);
//       return;
//     }

//     // Allow doctors to access any patient's biometric data
//     if (tokenUser.role === "DOCTOR") {
//       const data = await Biometric.find({ patientId: requestedPatientId });
//       response.ok(res, data);
//       return;
//     }

//     // For patients, verify they can only access their own data
//     if (tokenUser.role === "PATIENT" && requestedPatientId !== tokenUser.userId) {
//       response.err(res, "Unauthorized access", 403);
//       return;
//     }

//     const data = await Biometric.find({ patientId: requestedPatientId });
//     response.ok(res, data);
//   } catch (error) {
//     response.err(res, "Error fetching biometric data");
//   }
// });

// Update patient profile
patientRouter.put("/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const requestedPatientId = req.query.patientId as string;
    const tokenUser = (req as any).user;
    const updatedProfile = req.body;

    if (!requestedPatientId) {
      response.err(res, "Patient ID is required", 400);
      return;
    }

    // Only allow patients to update their own profile
    if (requestedPatientId !== tokenUser.userId) {
      response.err(res, "Unauthorized access", 403);
      return;
    }

    const patient = await Patient.findOneAndUpdate(
      { patientId: requestedPatientId },
      { ...updatedProfile, patientId: requestedPatientId },
      { new: true }
    );

    if (!patient) {
      response.err(res, "Patient not found", 404);
      return;
    }

    response.ok(res, patient);
  } catch (error) {
    response.err(res, "Error updating profile");
  }
});

patientRouter.post("/post-ecg", async (req: Request, res: Response) => {
  try {
    const { patientId, ecg_value } = req.body;

    if (!patientId || ecg_value === undefined) {
      response.err(res, "Patient ID and ECG value are required", 400);
      return;
    }

    const ecgData = new ECG({
      patientId,
      timestamp: new Date(),
      ecg_value
    });

    await ecgData.save();

    response.ok(res, {
      message: "ECG data stored successfully",
      data: ecgData
    });
  } catch (error) {
    response.err(res, "Error storing ECG data");
  }
});

patientRouter.get("/ecg", verifyToken, async (req: Request, res: Response) => {
  try {
    const { patientId, startTime, endTime } = req.query;
    const tokenUser = (req as any).user;

    if (!patientId) {
      response.err(res, "Patient ID is required", 400);
      return;
    }

    // Verify access permissions
    if (tokenUser.role === "PATIENT" && patientId !== tokenUser.userId) {
      response.err(res, "Unauthorized access", 403);
      return;
    }

    // Build query filter
    const filter: any = { patientId };
    
    // Add time range filter if provided
    if (startTime && endTime) {
      filter.timestamp = {
        $gte: new Date(startTime as string),
        $lte: new Date(endTime as string)
      };
    }

    const ecgData = await ECG.find(filter).sort({ timestamp: 1 });

    response.ok(res, {
      ecgData,
      total: ecgData.length
    });
  } catch (error) {
    response.err(res, "Error fetching ECG data");
  }
});

patientRouter.post("/submit-report", verifyToken, async (req: Request, res: Response) => {
  try {
    const { patientId, temperature, bloodOxygen, source, heartRate } = req.body;
    const tokenUser = (req as any).user;

    // Validate input
    if (!patientId || temperature === undefined || bloodOxygen === undefined || !source || heartRate === undefined) {
      response.err(res, "All fields are required: patientId, temperature, sp02, source, heartRate", 400);
      return;
    }

    // Verify patient access
    if (tokenUser.role === "PATIENT" && patientId !== tokenUser.userId) {
      response.err(res, "Unauthorized access", 403);
      return;
    }

    // Create report
    const report = new Report({
      reportId: `REP${Date.now()}`,
      patientId,
      doctorId: tokenUser.role === "DOCTOR" ? tokenUser.userId : (await Patient.findOne({ patientId }))?.doctorId || null,
      timestamp: new Date(),
      source,
      status: 'Normal',
      type: 'Remote Checkup',
      isViewed: false,
      temperature,
      bloodOxygen,
      heartRate
    });

    await report.save();
    response.ok(res, { message: "Report created successfully", report });
  } catch (error) {
    response.err(res, "Error creating report");
  }
});

export default patientRouter;