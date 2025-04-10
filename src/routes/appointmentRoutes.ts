import express, { Request, Response } from "express";
import { response } from "../utils/responseHandler";

const appointmentRouter = express.Router();

appointmentRouter.post("/create", async (req: Request, res: Response) => {
  try {
    // TODO: Create appointment logic
    response.ok(res, { message: "Appointment created successfully" });
  } catch (error) {
    response.err(res, "Error creating appointment");
  }
});

appointmentRouter.get("/list", async (req: Request, res: Response) => {
  try {
    // TODO: List appointments logic
    response.ok(res, { appointments: [] });
  } catch (error) {
    response.err(res, "Error fetching appointments");
  }
});

export default appointmentRouter;