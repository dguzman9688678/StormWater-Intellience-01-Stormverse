# StormVerse Data Directory

This directory contains weather data files, KMZ uploads, and GeoJSON data for the StormVerse Environmental Intelligence Platform.

## File Types Supported

### Hurricane and Weather Data
- `*.kmz` - NOAA hurricane track files and weather forecast data
- `*.kml` - Google Earth compatible weather data
- `*.geojson` - GeoJSON format geographical data

### Example Files Structure
```
/data/
├── hurricanes_2024/
│   ├── al052024_best_track.kmz     # Hurricane tracking data
│   ├── wind_probs.kmz              # Wind probability forecasts
│   └── storm_surge.kmz             # Storm surge predictions
├── user_uploads/
│   ├── bmp_plan.geojson           # Business Continuity Plan data
│   ├── flood_zones.kmz            # Flood zone boundaries
│   └── evacuation_routes.geojson  # Emergency evacuation routes
└── satellite_imagery/
    ├── goes_east_latest.kmz       # GOES East satellite data
    └── radar_composite.kmz        # Weather radar composite
```

## Data Sources

### NOAA GIS Data Access
- **Hurricane Database (HURDAT)**: Historical hurricane tracks and intensity
- **National Hurricane Center (NHC)**: Real-time hurricane forecasts
- **Weather Radar**: NEXRAD composite imagery
- **Satellite Data**: GOES-East and GOES-West imagery

### User Upload Guidelines
1. **File Size**: Maximum 50MB per file
2. **Coordinate System**: WGS84 (EPSG:4326) preferred
3. **Metadata**: Include source, timestamp, and authorship information
4. **Security**: All uploads processed through ARCSEC verification

## Loading Data in StormVerse

### Using Storm Layer Loader
```javascript
// Load hurricane track
stormLoader.loadHurricaneTrack('al052024_best_track.kmz');

// Load wind probabilities
stormLoader.loadWindProbabilities('wind_probs.kmz');

// Load custom GeoJSON
stormLoader.loadGeoJSON('user_uploads/bmp_plan.geojson');
```

### ARCSEC Security Integration
All data files are automatically processed with:
- **Data Integrity**: SHA-256 hash verification
- **Authorship Tracking**: Digital signature validation
- **Provenance Chain**: Source and modification tracking
- **Timestamp Authority**: RFC3161 compliant timestamps

## Data Processing Workflow

1. **Upload/Download**: Files placed in appropriate subdirectory
2. **ARCSEC Scan**: Security verification and metadata extraction
3. **Format Validation**: Coordinate system and structure validation
4. **Cesium Integration**: Conversion to Cesium-compatible format
5. **Visualization**: Real-time rendering on 3D globe
6. **Agent Analysis**: AI agent processing for insights

## Real-time Data Feeds

### NOAA API Integration
- **Weather Alerts**: 5-minute refresh interval
- **Hurricane Updates**: 30-minute refresh interval
- **Radar Imagery**: 15-minute refresh interval

### Mock Data for Development
When NOAA APIs are unavailable, the system uses scientifically accurate mock data for:
- Hurricane track predictions
- Wind probability cones
- Weather alert simulations

## Troubleshooting

### Common Issues
1. **File Not Loading**: Check file permissions and format validity
2. **Coordinate Errors**: Ensure WGS84 coordinate system
3. **Performance Issues**: Large files may require optimization
4. **Security Errors**: ARCSEC verification failures need manual review

### Support
For data loading issues or format questions, check the browser console for detailed error messages from the Storm Layer Loader.