/**
 * Format a user's name for display.
 * Shows first name + last name initial (e.g., "Chandika V")
 * 
 * @param firstName - The user's first name
 * @param lastName - The user's last name (optional)
 * @returns Formatted display name
 */
export const formatUserName = (firstName?: string | null, lastName?: string | null): string => {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  
  if (!first && !last) return 'Unknown User';
  if (!last) return first;
  
  const lastInitial = last.charAt(0).toUpperCase();
  return `${first} ${lastInitial}`;
};

/**
 * Format name for avatar URL (ui-avatars.com)
 * Uses first name + last initial for consistency
 */
export const formatAvatarName = (firstName?: string | null, lastName?: string | null): string => {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  
  if (!first && !last) return 'U';
  if (!last) return first;
  
  const lastInitial = last.charAt(0).toUpperCase();
  return `${first}+${lastInitial}`;
};
