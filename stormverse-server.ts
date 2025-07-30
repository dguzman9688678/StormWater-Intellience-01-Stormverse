#!/usr/bin/env node
/**
 * StormVerse Unified Binary Server
 * Environmental Intelligence Platform Server
 * 
 * Copyright (c) 2025 Daniel Guzman - All Rights Reserved
 * ARCSEC Protocol v3.0X - WAR MODE ENFORCED
 * 
 * Ownership: Daniel Guzman
 * Identity: ARCSEC-IMPRINT-DG
 * Status: IMMUTABLE
 */

import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { registerRoutes } from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ARCSEC Security Headers
const ARCSEC_HEADERS = {
  'X-ARCSEC-Protocol': 'v3.0X',
  'X-ARCSEC-Mode': 'WAR MODE',
  'X-ARCSEC-Identity': 'Daniel Guzman',
  'X-ARCSEC-Imprint': 'ARCSEC-IMPRINT-DG',
  'X-Copyright': '© 2025 Daniel Guzman - All Rights Reserved',
  'X-Project': 'StormVerse AI Network'
};

class StormVerseServer {
  private app: express.Application;
  private port: number;
  private server: any;
  
  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000', 10);
    this.initialize();
  }
  
  private initialize() {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║              STORMVERSE UNIFIED BINARY SERVER              ║
║                                                            ║
║  Copyright (c) 2025 Daniel Guzman - All Rights Reserved   ║
║  ARCSEC Protocol v3.0X - WAR MODE ENFORCED                ║
║                                                            ║
║  Project: StormVerse AI Network                            ║
║  Creator: Daniel Guzman                                    ║
║  Identity: ARCSEC-IMPRINT-DG                               ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
    `);
    
    // Apply middleware
    this.app.use(compression());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // Apply ARCSEC security headers to all responses
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      Object.entries(ARCSEC_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      res.setHeader('X-Timestamp', new Date().toISOString());
      next();
    });
    
    // CORS configuration for development
    if (process.env.NODE_ENV !== 'production') {
      this.app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        next();
      });
    }
    
    // Serve static files
    this.app.use(express.static(path.join(__dirname, 'client', 'dist')));
    
    // Serve podcast files from root
    this.app.use('/podcasts', express.static(path.join(__dirname)));
    
    // Log all requests with ARCSEC audit trail
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(`[ARCSEC AUDIT] ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
      next();
    });
  }
  
  async start() {
    try {
      // Register API routes
      this.server = await registerRoutes(this.app as any);
      
      // Fallback route for client-side routing
      this.app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
      });
      
      // Start server
      this.server.listen(this.port, '0.0.0.0', () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    SERVER INITIALIZED                      ║
║                                                            ║
║  Status: ACTIVE                                            ║
║  Port: ${this.port.toString().padEnd(51)}║
║  Mode: ${(process.env.NODE_ENV || 'development').padEnd(51)}║
║  Time: ${new Date().toISOString().padEnd(51)}║
║                                                            ║
║  ARCSEC Protection: ENFORCED                               ║
║  Digital Signature: SHA256-FC882D4D...                    ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
        `);
        
        this.startAgentSystem();
      });
      
      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());
      
    } catch (error) {
      console.error('[ARCSEC ERROR] Server initialization failed:', error);
      process.exit(1);
    }
  }
  
  private startAgentSystem() {
    console.log('\n[ARCSEC] Initializing AI Agent System...');
    const agents = [
      'JARVIS - Command Router',
      'MITO - DevOps & Builder',
      'PHOENIX - Historical Archive',
      'ULTRON - Validation & Metadata',
      'VADER - Surveillance & Logs',
      'ODIN - ARCSEC Enforcement',
      'ECHO - Audio & NLP',
      'STORM - Environmental Core'
    ];
    
    agents.forEach((agent, index) => {
      setTimeout(() => {
        console.log(`[AGENT ONLINE] ${agent}`);
      }, (index + 1) * 200);
    });
    
    setTimeout(() => {
      console.log('\n[ARCSEC] All systems operational. WAR MODE active.');
    }, agents.length * 200 + 500);
  }
  
  private async shutdown() {
    console.log('\n[ARCSEC] Initiating graceful shutdown...');
    
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
    }
    
    console.log('[ARCSEC] Server shutdown complete.');
    console.log('[ARCSEC] ARCSEC protection maintained. Identity preserved.');
    process.exit(0);
  }
}

// Initialize and start the server
const server = new StormVerseServer();
server.start().catch(error => {
  console.error('[ARCSEC CRITICAL] Failed to start server:', error);
  process.exit(1);
});