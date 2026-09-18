/**
 * Client-side contact content moderation
 * Mirrors backend utils/contactContentModeration.js
 * Blocks personal contact details (phone, email, websites) in user-submitted text.
 */

const PHONE_PATTERNS = [
  /(\+?61\s?)?0?4\d{2}\s?\d{3}\s?\d{3}/gi,
  /(\+?61\s?)?0?\s?[2-9]\d{1,2}\s?\d{3,4}\s?\d{3,4}/gi,
  /\+\d{1,3}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/gi,
  /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/gi,
  /\(\d{2,4}\)\s?\d{3,4}[-.\s]?\d{3,4}/gi,
  /\b\d{10,}\b/g,
];

const EMAIL_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
];

const WEBSITE_PATTERNS = [
  /\bhttps?:\/\/[^\s]+/gi,
  /\bwww\.[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+\b/gi,
  /\b[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.(?:com|net|org|io|app|au|co\.uk|biz|info)(?:\/[^\s]*)?\b/gi,
];

const CONTACT_OBFUSCATION_PATTERNS = [
  /\b(call|text|message|contact|reach|email|phone|mobile|whatsapp|wa)\s*(me|us)?\s*(at|on|@)?\s*[:\-]?\s*\d/gi,
  /\b(dm|pm|inbox)\s*(me|us)\b/gi,
];

function firstMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    const match = text.match(pattern);
    if (match && match[0]) {
      return match[0];
    }
  }
  return null;
}

export interface ModerationResult {
  isClean: boolean;
  reason?: string;
  detectedType?: 'phone' | 'email' | 'website' | 'contact';
}

export function validateContactContent(text: string): ModerationResult {
  if (!text || typeof text !== 'string') {
    return { isClean: true };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { isClean: true };
  }

  const warning =
    'Do not include personal contact details (phone, email, or websites). Please amend and resubmit.';

  if (firstMatch(trimmed, PHONE_PATTERNS)) {
    return { isClean: false, reason: warning, detectedType: 'phone' };
  }

  if (firstMatch(trimmed, EMAIL_PATTERNS)) {
    return { isClean: false, reason: warning, detectedType: 'email' };
  }

  if (firstMatch(trimmed, WEBSITE_PATTERNS)) {
    return { isClean: false, reason: warning, detectedType: 'website' };
  }

  for (const pattern of CONTACT_OBFUSCATION_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(trimmed)) {
      return { isClean: false, reason: warning, detectedType: 'contact' };
    }
  }

  return { isClean: true };
}
