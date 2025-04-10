import express, { Request, Response } from "express";
import cors from 'cors';
import authRouter from './routes/authRoutes';
import patientRouter from "./routes/patientRoutes";
import doctorRouter from "./routes/doctorRoutes";
import appointmentRouter from "./routes/appointmentRoutes";

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

app.use(express.json());

app.get("/", async (req: Request, res: Response): Promise<void> => {
  res.send("Wecare API");
});

app.use("/auth", authRouter);
app.use("/patient", patientRouter);
app.use("/doctor", doctorRouter);
app.use("/appointments", appointmentRouter);

app.listen(5000,'0.0.0.0', () => {
  console.log("Server Running at http://0.0.0.0:5000/");
});
