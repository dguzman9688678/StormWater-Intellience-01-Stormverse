# StormVerse API Documentation
## Environmental Intelligence Platform API Reference
© 2025 Daniel Guzman - All Rights Reserved

---

## Base URL
```
http://localhost:5000
```

---

## Health & Status Endpoints

### GET /health
Basic health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-30T12:00:00.000Z"
}
```

### GET /api/system/status
Comprehensive system status including all subsystems.

**Response:**
```json
{
  "health": {
    "status": "healthy",
    "load": 42,
    "anomalies": 0,
    "warnings": 0,
    "critical": 0
  },
  "agents": [...],
  "database": {
    "connected": true,
    "type": "postgresql",
    "tables": 7
  },
  "project": "StormVerse AI Network",
  "creator": "Daniel Guzman",
  "arcsec": {
    "status": "ENFORCED",
    "mode": "WAR MODE",
    "protocol": "v3.0X"
  }
}
```

---

## Weather Data Endpoints

### GET /api/weather/hurricanes
Retrieves current hurricane tracking data.

**Response:**
```json
{
  "hurricanes": [
    {
      "id": "AL012025",
      "name": "ALPHA",
      "latitude": 25.5,
      "longitude": -70.0,
      "category": 3,
      "windSpeed": 115,
      "pressure": 945,
      "movementSpeed": 12,
      "movementDirection": 315
    }
  ]
}
```

### GET /api/weather/alerts
Retrieves current weather alerts from NOAA.

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert_001",
      "type": "Hurricane Warning",
      "severity": "Extreme",
      "areas": ["Florida Keys", "Miami-Dade"],
      "description": "Hurricane warning in effect"
    }
  ]
}
```

---

## Storm Data Integration

### GET /api/storm/metrics
Retrieves metrics from the StormWater Intelligence Platform integration.

**Response:**
```json
{
  "status": "active",
  "platform": "StormWater Intelligence Platform",
  "version": "3.4",
  "metrics": {
    "totalFiles": 443,
    "categories": 10,
    "securityAudits": 45,
    "lastUpdated": "2025-01-30T12:00:00.000Z"
  },
  "attribution": "Copyright (c) 2025 Daniel Guzman - All Rights Reserved"
}
```

---

## Diagnostics Endpoints

### GET /api/diagnostics
Retrieves comprehensive system diagnostics with loop detection.

**Response:**
```json
{
  "signals": [
    {
      "name": "signal_repetition",
      "status": "normal",
      "value": 0.12,
      "threshold": 0.7,
      "description": "Token repetition detection",
      "childExplanation": "This is being said over and over again."
    }
  ],
  "flags": [
    {
      "name": "flag_loop_1",
      "active": false,
      "severity": "low",
      "description": "Pattern repetition without progress",
      "childExplanation": "Something is happening again and again."
    }
  ],
  "eventEvaluation": "System Normal",
  "systemLoad": 42,
  "timestamp": "2025-01-30T12:00:00.000Z"
}
```

### GET /api/diagnostics/health
Simplified health status for monitoring.

---

## Quantum Analysis Endpoints

### GET /api/quantum/states
Retrieves quantum state information for data analysis.

**Response:**
```json
[
  {
    "name": "Document Metadata",
    "quantum_number": 1,
    "amplitude": 1.000,
    "phase": 0.000,
    "energy_level": "0.1 ℏω",
    "coherence": 1.000
  }
]
```

### GET /api/quantum/entanglement
Retrieves entangled data pairs and correlations.

### GET /api/quantum/metrics
Retrieves quantum computing metrics.

### GET /api/quantum/analysis
Comprehensive quantum analysis including all quantum data.

---

## AI Agent Management

### GET /api/agents
Lists all AI agents in the system.

**Response:**
```json
[
  {
    "id": "jarvis",
    "name": "JARVIS",
    "status": "active",
    "role": "Command Router - Central coordination",
    "lastActivity": "2025-01-30T12:00:00.000Z",
    "metrics": {
      "tasksCompleted": 1234,
      "successRate": 0.95,
      "avgResponseTime": 125.5
    }
  }
]
```

### GET /api/agents/status
Aggregated status of all agents.

### GET /api/agents/:id
Retrieves specific agent details.

### PUT /api/agents/:id/status
Updates agent status.

**Request Body:**
```json
{
  "status": "processing"
}
```

---

## Database Management

### GET /api/database/status
Retrieves database connection and table status.

**Response:**
```json
{
  "connected": true,
  "type": "postgresql",
  "tables": [
    {
      "name": "users",
      "recordCount": 156,
      "lastActivity": "2025-01-30T11:45:00.000Z",
      "status": "active"
    }
  ],
  "metrics": {
    "totalRecords": 5432,
    "activeConnections": 3,
    "queryPerformance": 25.4
  }
}
```

### GET /api/database/schema/:table
Retrieves schema for a specific table.

---

## Metadata & Security

### GET /api/metadata/system
System metadata including project information.

### GET /api/metadata/session
Current session summary and status.

### GET /api/metadata/arcsec
ARCSEC security protocol status.

**Response:**
```json
{
  "status": "ENFORCED",
  "mode": "WAR MODE",
  "protocol": "v3.0X",
  "imprint": "ARCSEC-IMPRINT-DG",
  "authorship": "Immutable",
  "security": "LOCKED",
  "identity": "Daniel Guzman",
  "signature": "SHA256-FC882D4D...",
  "timestamp": "2025-01-30T12:00:00.000Z"
}
```

---

## KMZ/GeoJSON Processing

### POST /api/data/kmz
Process and upload KMZ files.

**Request:** Multipart form data with KMZ file

**Response:**
```json
{
  "success": true,
  "data": {
    "features": [...],
    "bounds": {...}
  }
}
```

---

## Semantic Data Store

### GET /api/data/semantic/:type
Query semantic data by type.

### POST /api/data/semantic
Store semantic data in triple store.

**Request Body:**
```json
{
  "@context": "https://schema.org/",
  "@type": "GeoCoordinates",
  "latitude": 34.1,
  "longitude": -118.7,
  "description": "Storm tracking point"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Description of the error",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-30T12:00:00.000Z"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error