import React from 'react';
import { stormWaterIntegration } from '../lib/stormwater-integration';

export default function AttributionFooter() {
  const attribution = stormWaterIntegration.getAttribution();
  const metadata = stormWaterIntegration.getMetadata();
  
  return (
    <div className="attribution-footer">
      <div className="attribution-text">
        {attribution}
      </div>
      <div className="attribution-links">
        <a 
          href="mailto:guzman.danield@outlook.com" 
          className="attribution-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact
        </a>
        <span className="attribution-separator">•</span>
        <a 
          href="https://github.com/dguzman9688678/ARCSEC-" 
          className="attribution-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}