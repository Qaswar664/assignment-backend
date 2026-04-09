/**
 * Vercel serverless entry: forwards all HTTP traffic to the NestJS Express app
 * compiled to dist/src/vercel.js. Run `npm run build` before deploy (Vercel does this).
 */
export default async function handler(req: unknown, res: unknown): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('../dist/src/vercel.js') as {
    default: (a: unknown, b: unknown) => Promise<void>;
  };
  await mod.default(req, res);
}
