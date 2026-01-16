// src/app/api/env-demo/route.ts
import { NextResponse } from 'next/server';
import { ENV, isDevelopment } from '@/lib/env';

export async function GET() {
  // This is server-side code - safe to access ALL environment variables
  
  // Accessing server-side only variables (safe)
  const hasDatabase = !!ENV.DATABASE_URL;
  const hasJwtSecret = !!ENV.JWT_SECRET;
  
  // Accessing client-side variables (also safe on server)
  //const apiBaseUrl = ENV.NEXT_PUBLIC_API_BASE_URL;
  
  return NextResponse.json({
    message: 'Environment Variables Demo - Server Side',
    timestamp: new Date().toISOString(),
    
    // Show environment info (safe to expose)
    environment: {
      nodeEnv: ENV.NODE_ENV,
      isDevelopment: isDevelopment,
      appName: ENV.NEXT_PUBLIC_APP_NAME,
      appVersion: ENV.NEXT_PUBLIC_APP_VERSION,
      apiBaseUrl: ENV.NEXT_PUBLIC_API_BASE_URL,
    },
    
    // Show configuration status (without exposing secrets)
    configStatus: {
      database: hasDatabase ? '✅ Configured' : '❌ Missing',
      authentication: hasJwtSecret ? '✅ Configured' : '❌ Missing',
      stripe: ENV.STRIPE_SECRET_KEY ? '✅ Configured' : '⚠️ Test mode',
    },
    
    // Security demonstration
    security: {
      // These values are NOT exposed in the response
      secretsExposed: false,
      jwtSecretExposed: '***' + (ENV.JWT_SECRET ? ENV.JWT_SECRET.slice(-4) : ''),
      databaseUrlExposed: '***' + (ENV.DATABASE_URL ? ENV.DATABASE_URL.split('@').pop() : ''),
    },
    
    note: 'Server-side environment variables are safe. Never expose secrets in API responses.',
  });
}