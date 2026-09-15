import React from 'react';

/**
 * OfflineBanner has been unified into EnhancedOfflineBanner mounted globally at root level in app/_layout.tsx.
 * This component returns null to prevent duplicate stacked offline banners on screens.
 */
export const OfflineBanner: React.FC = () => {
  return null;
};
