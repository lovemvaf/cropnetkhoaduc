import { NextResponse } from 'next/server';
import { VERIFIED_BATCHES } from '@/data/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: Object.values(VERIFIED_BATCHES)
  });
}
