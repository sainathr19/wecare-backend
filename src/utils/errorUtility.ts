import { Response } from "express";

export function handleError(
  res: Response,
  error: unknown,
  message = "Internal Server Error"
) {
  console.error(error); // Logging the error for debugging
  res
  .status(500)
  .json({ status: "error", message });
  return;
}
