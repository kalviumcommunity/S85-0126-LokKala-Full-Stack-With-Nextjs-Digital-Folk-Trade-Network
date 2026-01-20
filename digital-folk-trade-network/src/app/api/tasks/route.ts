import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: 1, task: 'Setup API routes' },
    { id: 2, task: 'Write documentation' }
  ]);
}
