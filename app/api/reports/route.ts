import { NextResponse } from 'next/server';
import generateReport from '../../../lib/report';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, urls } = body;
    if (!text && (!urls || urls.length === 0)) {
      return NextResponse.json({ error: 'Provide `text` or `urls` in request body' }, { status: 400 });
    }

    const out = await generateReport({ text, urls });
    return NextResponse.json(out, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
