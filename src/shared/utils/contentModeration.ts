/**
 * Content Moderation Utility
 * 
 * Detects and blocks inappropriate content including:
 * - Phone numbers
 * - Email addresses
 * - Website URLs
 * - Other contact information
 * 
 * This helps protect users and enforce platform policies.
 */

const CONTACT_WARNING =
  'Do not include personal contact details (phone, email, or websites). Please amend and resubmit.';

// Phone number patterns - detects various formats
const PHONE_PATTERNS = [
  // Australian formats
  /(\+?61\s?)?0?4\d{2}\s?\d{3}\s?\d{3}/gi, // 0412 345 678 or +61 412 345 678
  /(\+?61\s?)?0?\s?[2-9]\d{1,2}\s?\d{3,4}\s?\d{3,4}/gi, // General AU numbers
  
  // International formats
  /\+\d{1,3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,9}/gi, // +1 234 567 8900
  /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/gi, // 123-456-7890 or 123.456.7890
  /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/gi, // (123) 456-7890
  
  // Generic long numbers (10+ digits)
  /\b\d{10,}\b/g, // Any sequence of 10+ digits
];

// Email patterns
const EMAIL_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, // Standard email
  /[a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,}/gi, // Email with spaces
  /[a-zA-Z0-9._%+-]+\s*\[\s*at\s*\]\s*[a-zA-Z0-9.-]+\s*\[\s*dot\s*\]\s*[a-zA-Z]{2,}/gi, // email [at] domain [dot] com
  /[a-zA-Z0-9._%+-]+\s*\(\s*at\s*\)\s*[a-zA-Z0-9.-]+\s*\(\s*dot\s*\)\s*[a-zA-Z]{2,}/gi, // email (at) domain (dot) com
];

// Website / URL patterns
const WEBSITE_PATTERNS = [
  /https?:\/\/[^\s]+/gi, // http:// or https://
  /www\.[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}[^\s]*/gi, // www.example.com
  /\b[a-zA-Z0-9][-a-zA-Z0-9]*\.(com|net|org|io|co|au|uk|nz|info|biz|me|app|dev|xyz)(\/[^\s]*)?\b/gi, // example.com / example.com.au paths
  /\b[a-zA-Z0-9][-a-zA-Z0-9]*\s*\[\s*dot\s*\]\s*[a-zA-Z]{2,}/gi, // example [dot] com
  /\b[a-zA-Z0-9][-a-zA-Z0-9]*\s*\(\s*dot\s*\)\s*[a-zA-Z]{2,}/gi, // example (dot) com
];

// Contact obfuscation patterns (trying to hide contact info)
const OBFUSCATION_PATTERNS = [
  /\b(call|text|message|contact|reach|email|phone|mobile|whatsapp|wa)\s*(me|us)?\s*(at|on|@)?\s*[:\-]?\s*\d/gi,
  /\b(dm|pm|inbox)\s*(me|us)/gi,
  /\b(my|our)\s*(number|email|phone|contact|website|site|url)/gi,
];

export interface ModerationResult {
  isClean: boolean;
  reason?: string;
  detectedType?: 'phone' | 'email' | 'website' | 'contact';
  matchedPattern?: string;
}

/**
 * Check if text contains phone numbers
 */
function containsPhoneNumber(text: string): boolean {
  return PHONE_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check if text contains email addresses
 */
function containsEmail(text: string): boolean {
  return EMAIL_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check if text contains website URLs
 */
function containsWebsite(text: string): boolean {
  return WEBSITE_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check if text contains obfuscated contact info attempts
 */
function containsContactObfuscation(text: string): boolean {
  return OBFUSCATION_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Main moderation function - checks if text is appropriate
 * @param text - The text to moderate
 * @returns ModerationResult with isClean status and reason if blocked
 */
export function moderateContent(text: string): ModerationResult {
  if (!text || typeof text !== 'string') {
    return { isClean: true };
  }

  const trimmedText = text.trim();
  
  if (trimmedText.length === 0) {
    return { isClean: true };
  }

  // Check for phone numbers
  for (const pattern of PHONE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return {
        isClean: false,
        reason: CONTACT_WARNING,
        detectedType: 'phone',
        matchedPattern: match[0]
      };
    }
  }

  // Check for email addresses
  for (const pattern of EMAIL_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return {
        isClean: false,
        reason: CONTACT_WARNING,
        detectedType: 'email',
        matchedPattern: match[0]
      };
    }
  }

  // Check for website URLs
  for (const pattern of WEBSITE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return {
        isClean: false,
        reason: CONTACT_WARNING,
        detectedType: 'website',
        matchedPattern: match[0]
      };
    }
  }

  // Check for contact obfuscation attempts
  if (containsContactObfuscation(text)) {
    return {
      isClean: false,
      reason: CONTACT_WARNING,
      detectedType: 'contact',
    };
  }

  return { isClean: true };
}

/**
 * Quick check - returns true if content is blocked
 */
export function isContentBlocked(text: string): boolean {
  return !moderateContent(text).isClean;
}

/**
 * Get human-readable reason for blocked content
 */
export function getBlockedReason(text: string): string {
  const result = moderateContent(text);
  return result.reason || CONTACT_WARNING;
}

/** Statuses where contact details are allowed in task chat (post-assign). */
export const ASSIGNED_CHAT_CONTACT_STATUSES = [
  'todo',
  'assigned',
  'pending_completion',
] as const;

export function allowsContactInChat(taskStatus?: string | null): boolean {
  if (!taskStatus) return false;
  return (ASSIGNED_CHAT_CONTACT_STATUSES as readonly string[]).includes(taskStatus);
}
