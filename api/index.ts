import 'reflect-metadata';
import { existsSync } from 'fs';
import path from 'path';

const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;

function resolveNestHandlerPath(): string {
  const candidates = [
    path.join(process.cwd(), 'dist/src/vercel.js'),
    path.join(__dirname, '..', 'dist', 'src', 'vercel.js'),
    path.join(__dirname, 'dist', 'src', 'vercel.js'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error(
    `Nest handler not found. cwd=${process.cwd()} __dirname=${__dirname}. Tried: ${candidates.join(' | ')}`,
  );
}

type VercelishRes = {
  statusCode?: number;
  status?: (n: number) => unknown;
  setHeader?: (k: string, v: string) => void;
  end?: (b?: string) => void;
};

function sendJson(res: VercelishRes, status: number, body: Record<string, unknown>): void {
  if (typeof res.status === 'function') res.status(status);
  else res.statusCode = status;
  res.setHeader?.('Content-Type', 'application/json');
  res.end?.(JSON.stringify(body));
}

export default async function handler(req: unknown, res: unknown): Promise<void> {
  const r = res as VercelishRes;

  const missing = REQUIRED_ENV.filter(
    (k) => !process.env[k] || String(process.env[k]).trim() === '',
  );
  if (missing.length) {
    const msg = `Missing environment variables: ${missing.join(', ')}. Add them in Vercel Project Settings, then Redeploy.`;
    console.error('[api]', msg);
    sendJson(r, 500, { success: false, message: msg, missing: [...missing] });
    return;
  }

  try {
    const handlerPath = resolveNestHandlerPath();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(handlerPath) as {
      default: (a: unknown, b: unknown) => Promise<void>;
    };
    await mod.default(req, res);
  } catch (err) {
    console.error('[api] fatal', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    sendJson(r, 500, { success: false, message });
  }
}
