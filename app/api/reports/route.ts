import { NextResponse } from 'next/server';
import generateReport from '../../../lib/report';
import { saveReport, listReports } from '../../../services/reports';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, urls } = body;
    if (!text && (!urls || urls.length === 0)) {
      return NextResponse.json({ error: 'Provide `text` or `urls` in request body' }, { status: 400 });
    }

    const out = await generateReport({ text, urls });

    try {
      await saveReport(out.engine, out.result as Record<string, unknown>, body.urls?.[0] ?? null);
    } catch {
      // swallow persistence errors to avoid breaking response
    }

    return NextResponse.json(out, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');

    const res = await listReports(limit, offset);
    return NextResponse.json(res, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
