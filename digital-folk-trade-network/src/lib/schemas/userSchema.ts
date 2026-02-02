import { sanitizeInput } from "@/lib/sanitize";
import { z } from "zod";

export const userSchema = z.object({
    name: z.string().min(2,"Name must be at least 2 characters long").transform((v) => sanitizeInput(v)),
      email: z.string().email("Invalid email address").transform((v) => sanitizeInput(v)),
  age: z.number().min(18, "User must be 18 or older"),
}); 

export type UserInput = z.infer<typeof userSchema>;