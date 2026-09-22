// Catch-all Vercel serverless function: routes every /api/* request into
// the same Express app used for local dev, so the real backend (produce,
// orders, and Gemini-backed recipe generation) runs in production too.
import app from './_app.js';

export default app;
