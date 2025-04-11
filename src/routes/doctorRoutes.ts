import express, { Request, Response } from "express";
import { response } from "../utils/responseHandler";
import { verifyToken } from "../middlewares/auth";
import Patient from "../models/Patient";
import Report from "../models/Report";
import Biometric from "../models/Biometric";
import VitalLimits from "../models/VitalLimits";

const doctorRouter = express.Router();

doctorRouter.get("/profile", verifyToken, async (req: Request, res: Response) => {
  try {
    const tokenUser = (req as any).user;
    const doctorId = tokenUser.userId;

    // TODO: Add Doctor model and fetch actual doctor profile
    response.ok(res, { 
      message: "Doctor profile fetched",
      doctorId
    });
  } catch (error) {
    response.err(res, "Error fetching profile");
  }
});

doctorRouter.get("/patients", verifyToken, async (req: Request, res: Response) => {
  try {
    const tokenUser = (req as any).user;
    const doctorId = tokenUser.userId;
    
    if (!doctorId) {
      response.err(res, "Doctor ID is required", 400);
      return;
    }

    const patients = await Patient.find({ doctorId });
    
    // Get last checkup date for each patient
    const patientsWithLastCheckup = await Promise.all(patients.map(async (patient) => {
      const lastReport = await Report.findOne({ patientId: patient.patientId })
        .sort({ timestamp: -1 })
        .select('timestamp');
        
      return {
        ...patient.toObject(),
        lastCheckup: lastReport?.timestamp || null
      };
    }));

    response.ok(res, { 
      patients: patientsWithLastCheckup,
      total: patientsWithLastCheckup.length
    });
  } catch (error) {
    response.err(res, "Error fetching patient list");
  }
});

doctorRouter.get("/reports", verifyToken, async (req: Request, res: Response) => {
  try {
    const tokenUser = (req as any).user;
    const doctorId = tokenUser.userId;
    
    if (!doctorId) {
      response.err(res, "Doctor ID is required", 400);
      return;
    }

    const reports = await Report.find({ doctorId })
      .sort({ timestamp: -1 }); // Sort by timestamp descending

    response.ok(res, { 
      reports,
      total: reports.length
    });
  } catch (error) {
    response.err(res, "Error fetching reports");
  }
});

doctorRouter.get("/reports/:reportId", verifyToken, async (req: Request, res: Response) => {
  try { 

    const reportId = req.params.reportId;
    const tokenUser = (req as any).user;

    // Find the report
    const report = await Report.findOne({ reportId })
    .sort({ timestamp: -1 });
    if (!report) {
      response.err(res, "Report not found", 404);
      return;
    }

    // Get patient's full bio
    const patient = await Patient.findOne({ patientId: report.patientId });
    if (!patient) {
      response.err(res, "Patient not found", 404);
      return;
    }

    // If requester is a doctor, mark as viewed
    if (tokenUser.role === "DOCTOR") {
      report.isViewed = true;
      await report.save();
    }

    response.ok(res, {
      report,
      patientBio: patient
    });
  } catch (error) {
    response.err(res, "Error fetching report");
  }
});

doctorRouter.get("/stats", verifyToken, async (req: Request, res: Response) => {
  try {
    const tokenUser = (req as any).user;
    const doctorId = tokenUser.userId;
    
    if (!doctorId) {
      response.err(res, "Doctor ID is required", 400);
      return;
    }

    // Get total patients
    const totalPatients = await Patient.countDocuments({ doctorId });

    // Get abnormal cases (reports with status not "Normal")
    const abnormalCases = await Report.countDocuments({ 
      doctorId, 
      status: { $ne: "Normal" }
    });

    // Get today's pending reports
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pendingReports = await Report.countDocuments({
      doctorId,
      isViewed: false
    });

    response.ok(res, {
      totalPatients,
      abnormalCases,
      pendingReports
    });
  } catch (error) {
    response.err(res, "Error fetching dashboard statistics");
  }
});

doctorRouter.get("/insights", verifyToken, async (req: Request, res: Response) => {
  try {
    const tokenUser = (req as any).user;
    const doctorId = tokenUser.userId;
    
    if (!doctorId) {
      response.err(res, "Doctor ID is required", 400);
      return;
    }

    // Get all patients under this doctor
    const patients = await Patient.find({ doctorId });
    const patientIds = patients.map(patient => patient.patientId);

    // Get data for the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    // Generate dates array for last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    // Get all reports for these patients in last 7 days
    const reports = await Report.find({
      patientId: { $in: patientIds },
      timestamp: { $gte: last7Days.toISOString() }
    });

    // Process data day by day
    const insights = dates.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      // Get reports for this day
      const dayReports = reports.filter(report => {
        const reportDate = new Date(report.timestamp);
        return reportDate >= date && reportDate < nextDay;
      });

      // Count patients who submitted reports
      const reportedPatients = new Set(dayReports.map(r => r.patientId));
      
      return {
        date: date.toISOString().split('T')[0],
        remoteCheckups: reportedPatients.size,
        missedCheckups: patientIds.length - reportedPatients.size
      };
    });

    response.ok(res, { 
      insights,
      total: insights.length
    });
    
  } catch (error) {
    response.err(res, "Error fetching insights data");
  }
});

doctorRouter.post("/vital-limits", verifyToken, async (req: Request, res: Response) => {
  try {
    const tokenUser = (req as any).user;
    const doctorId = tokenUser.userId;
    const {
      patientId,
      temperatureMin,
      temperatureMax,
      bloodOxygenMin,
      bloodOxygenMax,
      heartRateMin,
      heartRateMax
    } = req.body;

    // Validate all required fields
    if (!patientId || 
        temperatureMin === undefined || temperatureMax === undefined ||
        bloodOxygenMin === undefined || bloodOxygenMax === undefined ||
        heartRateMin === undefined || heartRateMax === undefined) {
      response.err(res, "All vital limits (min and max) are required", 400);
      return;
    }

    const vitalLimits = await VitalLimits.findOneAndUpdate(
      { patientId, doctorId },
      {
        patientId,
        doctorId,
        temperature: {
          min: temperatureMin,
          max: temperatureMax
        },
        bloodOxygen: {
          min: bloodOxygenMin,
          max: bloodOxygenMax
        },
        heartRate: {
          min: heartRateMin,
          max: heartRateMax
        }
      },
      { upsert: true, new: true }
    );

    response.ok(res, vitalLimits);
  } catch (error) {
    response.err(res, "Error setting vital limits");
  }
});

export default doctorRouter;