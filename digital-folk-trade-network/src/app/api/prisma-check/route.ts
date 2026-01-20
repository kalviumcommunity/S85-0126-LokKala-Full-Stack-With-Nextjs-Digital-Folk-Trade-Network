import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [users, artifacts, orders, reviews] = await Promise.all([
      prisma.user.count(),
      prisma.artifact.count(),
      prisma.order.count(),
      prisma.review.count(),
    ]);

    return NextResponse.json({
      status: 'ok',
      totals: { users, artifacts, orders, reviews },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Prisma health check failed', error);
    return NextResponse.json(
      { status: 'error', message: 'Prisma health check failed' },
      { status: 500 },
    );
  }
}
