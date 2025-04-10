import express, { Request, Response } from "express";
import { response } from "../utils/responseHandler";
import { verifyToken } from "../middlewares/auth";
import Patient from "../models/Patient";
import Report from "../models/Report";
import Biometric from "../models/Biometric";

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
    response.ok(res, { 
      patients,
      total: patients.length
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

    const reports = await Report.find({ doctorId });
    response.ok(res, { 
      reports,
      total: reports.length
    });
  } catch (error) {
    response.err(res, "Error fetching reports");
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
    const pendingToday = await Report.countDocuments({
      doctorId,
      isViewed: false,
      timestamp: {
        $gte: today.toISOString()
      }
    });

    response.ok(res, {
      totalPatients,
      abnormalCases,
      pendingToday
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

    // Get data for the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const reports = await Report.aggregate([
      {
        $match: {
          doctorId,
          timestamp: { $gte: last7Days.toISOString() }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: { $dateFromString: { dateString: "$timestamp" } } }
          },
          inPersonVisits: {
            $sum: { $cond: [{ $eq: ["$type", "In-Person"] }, 1, 0] }
          },
          remoteCheckups: {
            $sum: { $cond: [{ $eq: ["$type", "Remote Checkup"] }, 1, 0] }
          },
          missedCheckups: {
            $sum: { $cond: [{ $eq: ["$status", "Missed"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    response.ok(res, { 
      insights: reports,
      total: reports.length
    });
    
  } catch (error) {
    response.err(res, "Error fetching insights data");
  }
});

export default doctorRouter;