import { NextResponse } from 'next/server'
// Route désactivée — extraction PDF gérée côté navigateur via pdf.js
export async function POST() {
  return NextResponse.json({ ok: false, error: 'Use client-side extraction' }, { status: 400 })
}
