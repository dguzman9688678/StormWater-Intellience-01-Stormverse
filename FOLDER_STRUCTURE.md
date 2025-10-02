# StormVerse - Folder Structure Documentation

This document provides a comprehensive overview of the StormVerse project structure and organization.

## 📁 Root Directory Structure

```
StormVerse/
├── 📄 README.md                    # Main project documentation
├── 📄 PROJECT_SUMMARY.md           # One-page project summary for investors
├── 📄 FOLDER_STRUCTURE.md          # This file - folder structure documentation
├── 🌐 index.html                   # Landing page dashboard
├── 📦 package.json                 # Node.js dependencies and scripts
├── ⚙️ tsconfig.json                # TypeScript configuration
├── ⚙️ vite.config.js               # Vite build configuration
├── 📁 client/                      # Frontend React application
├── 📁 server/                      # Backend Node.js/Express server
├── 📁 shared/                      # Shared TypeScript schemas
└── 📁 docs/                        # Additional project documentation
```

## 🎨 Client Directory (Frontend)

```
client/
├── 📄 index.html                   # Application entry HTML
├── 📄 package.json                 # Client-specific dependencies
├── 📁 public/                      # Static assets served by Vite
│   ├── 📁 data/                    # Weather data and KMZ files
│   │   ├── ⚠️ README.md            # Marks demo data - PLACEHOLDER
│   │   ├── hurricanes_2024.kmz     # Sample hurricane data
│   │   ├── sample_data.json        # Demo weather data
│   │   └── demo_loader.js          # Data loading utilities
│   ├── 📁 js/                      # Custom WebGL modules
│   │   ├── storm_layer_loader.js   # NOAA GIS data loader
│   │   ├── quantum_arc_renderer.js # Probability visualization
│   │   └── stats_overlay.js        # Performance monitoring
│   ├── 📁 textures/                # 3D visualization textures
│   │   ├── ⚠️ README.md            # Marks placeholders
│   │   ├── sky.png                 # Skybox texture (PLACEHOLDER)
│   │   ├── asphalt.png             # Ground texture (PLACEHOLDER)
│   │   ├── grass.png               # Vegetation texture (PLACEHOLDER)
│   │   ├── sand.jpg                # Beach texture (PLACEHOLDER)
│   │   └── wood.jpg                # Structure texture (PLACEHOLDER)
│   ├── 📁 sounds/                  # Audio assets
│   │   ├── ⚠️ README.md            # Marks placeholders
│   │   ├── background.mp3          # Ambient audio (PLACEHOLDER)
│   │   ├── hit.mp3                 # UI feedback (PLACEHOLDER)
│   │   └── success.mp3             # Notification (PLACEHOLDER)
│   ├── 📁 fonts/                   # Custom fonts
│   └── 📄 sw.js                    # Service Worker for offline support
└── 📁 src/                         # Source code
    ├── 📄 main.tsx                 # Application entry point
    ├── 📁 components/              # React components
    │   ├── 🌍 StormVerse.tsx       # Main application component
    │   ├── 🌐 CesiumGlobe.tsx      # 3D globe visualization
    │   ├── 🤖 AgentNetwork.tsx     # AI agent coordination
    │   ├── 🌪️ QuantumArcRenderer.tsx # Hurricane probability cones
    │   ├── 🌦️ WeatherOverlay.tsx   # Weather data display
    │   ├── 📊 SystemMonitor.tsx    # System diagnostics
    │   ├── 📁 ui/                  # Reusable UI components
    │   │   ├── cyberpunk-panel.tsx # Themed panel component
    │   │   └── ...
    │   └── ...                     # Other components
    ├── 📁 lib/                     # Utilities and libraries
    │   ├── 📁 stores/              # Zustand state management
    │   │   ├── useStormVerse.ts    # Main app state
    │   │   ├── useWeatherData.ts   # Weather data state
    │   │   └── useAgents.ts        # AI agent state
    │   ├── 📁 docs/                # Technical documentation
    │   │   ├── SYSTEM_ARCHITECTURE.md
    │   │   ├── AGENT_DESIGN_SPEC.md
    │   │   ├── ARCSEC_PROTOCOL.md
    │   │   ├── DATA_SOURCES.md
    │   │   ├── AI_LOGIC_FLOW.md
    │   │   ├── DEPLOYMENT_GUIDE.md
    │   │   └── GLOBE_INTERFACE_GUIDE.md
    │   ├── 📁 utils/               # Utility functions
    │   ├── LICENSE.md              # Project license
    │   └── ...
    ├── 📁 styles/                  # CSS stylesheets
    │   ├── cyberpunk.css           # Main theme
    │   └── ...
    └── 📁 pages/                   # Page components
        └── README.md               # Legacy documentation
```

## 🔧 Server Directory (Backend)

```
server/
├── 📄 index.ts                     # Server entry point
├── 📁 routes/                      # API endpoints
│   ├── weather.ts                  # Weather data API
│   ├── agents.ts                   # Agent management API
│   └── ...
├── 📁 services/                    # Business logic
│   ├── arcsec-dev.ts               # ARCSEC security protocol
│   ├── weather-service.ts          # Weather data integration
│   └── ...
├── 📁 db/                          # Database schemas
│   └── schema.ts                   # Drizzle ORM schema
└── 📁 middleware/                  # Express middleware
    └── auth.ts                     # Authentication
```

## 🔄 Shared Directory

```
shared/
├── 📁 types/                       # TypeScript type definitions
│   ├── weather.ts                  # Weather data types
│   ├── agents.ts                   # Agent types
│   └── ...
└── 📁 schemas/                     # Validation schemas
    └── ...
```

## 📚 Documentation Organization

### Client Documentation
- **Location**: `/client/src/lib/docs/`
- **Purpose**: Technical documentation for developers
- **Files**:
  - System Architecture
  - Agent Design Specifications
  - ARCSEC Security Protocol
  - Data Source Integration
  - AI Logic and Flow
  - Deployment Guide
  - Globe Interface Guide

### Asset Documentation
- **Data**: `/client/public/data/README.md` - Marks demo weather data
- **Textures**: `/client/public/textures/README.md` - Marks placeholder textures
- **Sounds**: `/client/public/sounds/README.md` - Marks placeholder audio

## 🏷️ File Type Legend

| Icon | Type | Description |
|------|------|-------------|
| 📄 | Document | Markdown or text documentation |
| 📦 | Package | npm package configuration |
| ⚙️ | Config | Configuration file |
| 🌐 | HTML | HTML file |
| 📁 | Directory | Folder containing multiple files |
| 🎨 | Component | React component |
| 🌍 | Main | Primary entry point |
| ⚠️ | Warning | Placeholder/demo content marker |

## 🔍 Key Directories Explained

### `/client/public/`
Static assets served directly by the web server. These files are not processed by Vite and are served as-is. Ideal for:
- Large data files (KMZ, GeoJSON)
- Third-party scripts (WebGL modules)
- Media assets (textures, sounds)

### `/client/src/components/`
React components organized by functionality. Each major feature has its own component file:
- **Visualization**: CesiumGlobe, QuantumArcRenderer
- **AI System**: AgentNetwork, AgentDeploymentShell
- **Data**: WeatherOverlay, KMZLoader, StormDataPanel
- **UI**: CyberpunkPanel and other reusable components

### `/client/src/lib/`
Utility functions, state management, and shared logic:
- **stores/**: Zustand state management stores
- **docs/**: Technical documentation
- **utils/**: Helper functions and utilities

### `/server/`
Backend Node.js/Express application providing:
- REST API endpoints
- WebSocket connections
- Database integration
- Business logic services

## ⚠️ Placeholder/Demo Assets

The following directories contain placeholder or demonstration assets that should be replaced in production:

1. **`/client/public/data/`** - Demo weather data files
   - Replace with real NOAA API integration
   - Use authenticated data sources

2. **`/client/public/textures/`** - Placeholder 3D textures
   - Replace with licensed high-resolution textures
   - Optimize for web delivery

3. **`/client/public/sounds/`** - Placeholder audio files
   - Replace with licensed audio assets
   - Optimize file sizes

All placeholder directories contain README.md files marking them clearly.

## 🚀 Build Output

When you run `npm run build`, the following directories are created:

```
dist/
├── client/                         # Built frontend assets
│   ├── assets/                     # Bundled and optimized JS/CSS
│   ├── index.html                  # Optimized HTML
│   └── ...
└── server/                         # Compiled backend code
    └── index.js                    # Bundled server
```

> **Note**: The `dist/` directory is excluded from version control via `.gitignore`

## 📦 Node Modules

```
node_modules/                       # npm dependencies (not in Git)
```

Installed via `npm install` and excluded from version control.

## 🔒 Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript compiler configuration |
| `vite.config.js` | Vite build tool configuration |
| `package.json` | Node.js project metadata and dependencies |
| `.gitignore` | Git version control exclusions |
| `.replit` | Replit IDE configuration |

## 🌳 Development vs Production

### Development
- Source files in `/client/src/` and `/server/`
- Hot module reloading
- Unminified code for debugging
- Demo/placeholder assets

### Production
- Built files in `/dist/`
- Optimized and minified
- Replace demo assets with licensed content
- Enable production security settings

## 📊 File Count Summary

- **Total Components**: 20+ React components
- **Documentation Files**: 10+ comprehensive docs
- **Configuration Files**: 5+ config files
- **Asset Types**: Textures, sounds, data files
- **Code Languages**: TypeScript, JavaScript, CSS
- **Lines of Code**: 10,000+ (estimated)

---

## 🔄 Keeping Structure Updated

When adding new files or directories:

1. Follow the existing organizational pattern
2. Update this documentation
3. Add README.md files for new directories
4. Mark demo/placeholder content clearly
5. Update `.gitignore` for build artifacts

---

**StormVerse** - Environmental Intelligence Platform  
*Organized for clarity, scalability, and professional development*

© 2024 Daniel Guzman
