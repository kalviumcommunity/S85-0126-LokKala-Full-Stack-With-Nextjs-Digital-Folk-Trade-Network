// // src/lib/env.ts
// import { z } from 'zod';

// // Environment variable validation schema
// const envSchema = z.object({
//   // Database
//   DATABASE_URL: z.string().url().min(1),
  
//   // Authentication (server-side only)
//   JWT_SECRET: z.string().min(32),
//   JWT_REFRESH_SECRET: z.string().min(32),
//   NEXTAUTH_SECRET: z.string().min(1),
//   NEXTAUTH_URL: z.string().url(),
  
//   // Client-side variables
//   NEXT_PUBLIC_API_BASE_URL: z.string().url(),
//   NEXT_PUBLIC_APP_NAME: z.string(),
//   NEXT_PUBLIC_APP_VERSION: z.string(),
//   NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'production', 'test']),
//   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
//   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
//   NEXT_PUBLIC_MAINTENANCE_MODE: z.enum(['true', 'false']).default('false'),
//   NEXT_PUBLIC_ENABLE_ANALYTICS: z.enum(['true', 'false']).default('false'),
  
//   // Payment gateway (server-side only)
//   STRIPE_SECRET_KEY: z.string().optional(),
//   STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
//   // Email (server-side only)
//   EMAIL_SERVER: z.string().optional(),
//   EMAIL_FROM: z.string().email().optional(),
  
//   // App config (server-side only)
//   NODE_ENV: z.enum(['development', 'production', 'test']),
//   LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
// });

// // Validate environment variables
// const env = envSchema.safeParse(process.env);

// if (!env.success) {
//   console.error('❌ Invalid environment variables:', env.error.format());
//   throw new Error('Invalid environment variables');
// }

// // Export validated environment variables
// export const ENV = env.data;
// export type Env = z.infer<typeof envSchema>;

// // Helper functions
// export const isDevelopment = ENV.NODE_ENV === 'development';
// export const isProduction = ENV.NODE_ENV === 'production';
// export const isTest = ENV.NODE_ENV === 'test';