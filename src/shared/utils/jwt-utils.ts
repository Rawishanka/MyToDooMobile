// JWT token utilities
/**
 * Decode JWT token to extract expiration time
 * Note: This doesn't validate the token, just decodes the payload
 */
export function decodeJWT(token: string): any {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.warn('⚠️ Invalid JWT format');
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    
    // Base64 decode (handle URL-safe base64)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired or will expire soon
 * @param token - JWT token string
 * @param bufferSeconds - Buffer time in seconds before considering token expired (default: 300 = 5 minutes)
 * @returns true if token is expired or will expire within buffer time
 */
export function isTokenExpired(token: string | null, bufferSeconds: number = 300): boolean {
  if (!token) return true;
  
  try {
    const payload = decodeJWT(token);
    
    if (!payload || !payload.exp) {
      console.warn('⚠️ Token has no expiration claim');
      return false; // If no exp claim, assume token is valid
    }
    
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferTime = bufferSeconds * 1000;
    
    const isExpired = currentTime >= (expirationTime - bufferTime);
    
    if (isExpired) {
      const timeUntilExpiration = (expirationTime - currentTime) / 1000;
      console.log(`⏰ Token will expire in ${Math.floor(timeUntilExpiration)} seconds`);
    }
    
    return isExpired;
  } catch (error) {
    console.error('❌ Error checking token expiration:', error);
    return false; // On error, assume token is valid to avoid false logouts
  }
}

/**
 * Get token expiration time in seconds from now
 * @param token - JWT token string
 * @returns seconds until expiration, or null if cannot determine
 */
export function getTokenExpiresIn(token: string | null): number | null {
  if (!token) return null;
  
  try {
    const payload = decodeJWT(token);
    
    if (!payload || !payload.exp) {
      return null;
    }
    
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const expiresInMs = expirationTime - currentTime;
    
    return Math.max(0, Math.floor(expiresInMs / 1000)); // Return seconds, minimum 0
  } catch (error) {
    console.error('❌ Error getting token expiration:', error);
    return null;
  }
}

/**
 * Extract user information from JWT token
 */
export function getUserFromToken(token: string | null): any {
  if (!token) return null;
  
  try {
    const payload = decodeJWT(token);
    return payload?.user || null;
  } catch (error) {
    console.error('❌ Error extracting user from token:', error);
    return null;
  }
}
