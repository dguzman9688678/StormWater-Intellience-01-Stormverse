import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  // Serve from client/dist first (built files)
  const clientDistPath = path.resolve(process.cwd(), "client/dist");
  const rootDistPath = path.resolve(process.cwd(), "dist");
  
  // Try client/dist first, then fall back to root dist
  app.use(express.static(clientDistPath));
  app.use(express.static(rootDistPath));
  
  // Handle client-side routing - serve index.html for non-API routes
  app.use("*", (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Try client dist first
    const clientIndexPath = path.resolve(clientDistPath, "index.html");
    const rootIndexPath = path.resolve(rootDistPath, "index.html");
    
    try {
      res.sendFile(clientIndexPath);
    } catch (error) {
      try {
        res.sendFile(rootIndexPath);
      } catch (fallbackError) {
        res.status(404).send('Application not found');
      }
    }
  });
}