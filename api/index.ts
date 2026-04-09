/**
 * Vercel serverless entry: forwards traffic to the Nest app in dist/.
 * `vercel.json` includes `dist/**` in this function bundle (required or require fails at runtime).
 */
export default async function handler(req: unknown, res: unknown): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('../dist/src/vercel.js') as {
      default: (a: unknown, b: unknown) => Promise<void>;
    };
    await mod.default(req, res);
  } catch (err) {
    console.error('[api] handler error', err);
    const r = res as { status?: (n: number) => unknown; end?: (s: string) => void };
    if (typeof r?.status === 'function') r.status(500);
    if (typeof r?.end === 'function') r.end('Internal Server Error');
  }
}
