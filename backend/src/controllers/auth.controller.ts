import { email, z } from "zod";
import catchErrors from "../utils/catchErrors";

const registerSchema = z
  .object({
    email: z.email().min(5).max(255),
    password: z.string().min(6).max(128),
    confirmPassword: z.string().min(6).max(128),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerHandler = catchErrors(async (req, res, next) => {
  const request = registerSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });
});
