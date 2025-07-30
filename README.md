# StormVerse - Environmental Intelligence Platform

## Overview

StormVerse is a professional environmental intelligence platform that combines 3D globe visualization with AI-powered weather analysis. The system integrates CesiumJS for 3D mapping, real-time NOAA weather data, KMZ file processing, and semantic data management through triple stores and ARCSEC security protocols.

## Features

- **3D Globe Visualization**: CesiumJS-powered earth with cyberpunk aesthetic
- **8-Agent AI Network**: Specialized AI agents for weather analysis and system management
- **Real-time Weather Data**: Live NOAA feeds with fallback demonstration data
- **Hurricane Tracking**: Quantum probability cones with confidence visualization
- **ARCSEC Security**: Complete data provenance and integrity verification
- **Professional Interface**: Stats overlay with agent monitoring and weather intelligence

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **3D Engine**: CesiumJS 1.118 with custom WebGL modules
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with cyberpunk theme
- **Data Sources**: NOAA Weather API, NHC storm data, custom KMZ/GeoJSON

## Architecture Components

### 1. WebGL UI Components
- `storm_layer_loader.js` - NOAA GIS data import system
- `quantum_arc_renderer.js` - AI probability visualization
- `stats_overlay.js` - Real-time monitoring interface

### 2. Data Pipeline
- `/data/` directory for KMZ/GeoJSON files
- NOAA API integration with authentication
- ARCSEC verification for all data sources

### 3. AI Agent Network
- 8 specialized agents with global positioning
- Real-time status monitoring and communication
- Command routing through JARVIS coordination hub

### 4. Security Framework
- ARCSEC protocol for data integrity
- Embedded metadata in all visualizations
- Digital signatures and provenance tracking

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use provided in-memory storage)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd stormverse
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Environment Variables

Create a `.env` file with:
```env
DATABASE_URL=your_postgresql_connection_string
CESIUM_ION_TOKEN=your_cesium_ion_token
NOAA_API_KEY=your_noaa_api_key (optional)
```

## Folder Structure

```
stormverse/
├── client/                 # Frontend React application
│   ├── public/
│   │   ├── js/            # WebGL modules
│   │   └── data/          # KMZ/GeoJSON files
│   └── src/
│       ├── components/    # React components
│       ├── lib/          # Stores and utilities
│       └── styles/       # Cyberpunk CSS themes
├── server/               # Backend Express server
├── shared/              # Shared TypeScript schemas
└── docs/               # Technical documentation
```

## Usage

### Loading Weather Data
The platform automatically fetches real-time weather data from NOAA APIs. When external APIs are unavailable, it uses scientifically accurate demonstration data.

### Agent Network
Eight AI agents monitor different aspects:
- **STORM_CITADEL**: Weather prediction and hurricane tracking
- **ULTRON**: Metadata validation and data integrity
- **JARVIS**: Command routing and system coordination
- **PHOENIX**: Data recovery and historical analysis
- **ODIN**: Security protocols and ARCSEC enforcement
- **ECHO**: Audio interface and human interaction
- **MITO**: Development automation and system updates
- **VADER**: Surveillance and system resilience

### Adding Custom Data
Place KMZ or GeoJSON files in `client/public/data/` and they will be automatically processed with ARCSEC verification.

## Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Replit Deployment
The platform is optimized for Replit deployment with automatic environment configuration.

## Documentation

- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)
- [Agent Design Specifications](docs/AGENT_DESIGN_SPEC.md)
- [Globe Interface Guide](docs/GLOBE_INTERFACE_GUIDE.md)
- [Data Sources](docs/DATA_SOURCES.md)
- [ARCSEC Security Protocol](docs/ARCSEC_PROTOCOL.md)

## License

This project is protected under the ARCSEC Protocol with custom licensing terms. See [LICENSE.md](LICENSE.md) for details.

## Support

For technical support or feature requests, please refer to the documentation or create an issue.

---

**StormVerse** - Professional Environmental Intelligence Platform
*Powered by advanced AI agents and quantum weather modeling*