import path from 'path';
import express from 'express';
import app from './server/app';

const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`أكاديمية الميكاترونكس تعمل بنجاح على http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('فشل بدء الخادم:', err);
  process.exit(1);
});

export default app;
