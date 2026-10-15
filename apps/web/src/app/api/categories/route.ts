import { NextResponse } from 'next/server';
import { VERIFIED_CATEGORIES } from '@/data/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: VERIFIED_CATEGORIES
  });
}
