import express, { Request, Response } from "express";
import cors from 'cors';
import authRouter from './routes/authRoutes'

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req: Request, res: Response): Promise<void> => {
  res.send("Wecare API");
});

app.use("/auth", authRouter);

app.listen(5000, () => {
  console.log("Server Running at http://localhost:5000/");
});
