import app from '../server/app';

export default async function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Handler Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'حدث خطأ غير متوقع في الخادم.',
        details: err?.message || String(err),
      });
    }
  }
}

export { app };
