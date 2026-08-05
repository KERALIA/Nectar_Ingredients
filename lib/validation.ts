// lib/validation.ts
// Centralized strict validation utility for Email, Phone, Address, and Name

export interface ValidationResult {
  isValid: boolean
  error?: string
  warning?: string
}

// Common email domain typos
const TYPO_DOMAINS: Record<string, string> = {
  'gmail.co': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'yahoo.co': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'hotmail.co': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlook.co': 'outlook.com',
}

/**
 * Validates email address format and checks for common domain typos
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' }
  }

  // Standard RFC 5322 compliant regex check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@company.com).' }
  }

  const parts = trimmed.split('@')
  if (parts.length === 2) {
    const domain = parts[1]

    // Check common domain typos
    if (TYPO_DOMAINS[domain]) {
      const suggested = `${parts[0]}@${TYPO_DOMAINS[domain]}`
      return {
        isValid: false,
        error: `Did you mean ${suggested}? Please check your email domain.`,
      }
    }

    // Check if domain ends with .co when it looks like gmail/yahoo/hotmail
    if (domain.endsWith('.co') && (domain.includes('gmail') || domain.includes('yahoo') || domain.includes('hotmail') || domain.includes('outlook'))) {
      const suggested = trimmed.replace(/\.co$/, '.com')
      return {
        isValid: false,
        error: `Did you mean ${suggested}? Please enter a valid email domain.`,
      }
    }
  }

  return { isValid: true }
}

/**
 * Validates phone numbers (accepts international format with country codes)
 */
export function validatePhone(phone: string): ValidationResult {
  const trimmed = phone.trim()
  if (!trimmed) {
    return { isValid: false, error: 'Phone / WhatsApp number is required.' }
  }

  // Strip spaces, dashes, parentheses, plus
  const digitsOnly = trimmed.replace(/[\s\-\(\)\+]/g, '')

  // Must contain only numbers and be between 8 and 15 digits
  if (!/^\d{8,15}$/.test(digitsOnly)) {
    return { isValid: false, error: 'Please enter a valid phone number (8 to 15 digits).' }
  }

  // Reject obvious repeated dummy patterns like 0000000000 or 1234567890
  if (/^(\d)\1{7,}$/.test(digitsOnly) || digitsOnly === '1234567890' || digitsOnly === '9876543210') {
    return { isValid: false, error: 'Please enter a real, reachability-verified phone number.' }
  }

  // If Indian number format (starts with 91 or 10 digits), check valid 10-digit mobile prefix (6,7,8,9)
  if (digitsOnly.length === 10 && !/^[6-9]\d{9}$/.test(digitsOnly)) {
    return { isValid: false, error: 'Indian mobile numbers must start with 6, 7, 8, or 9.' }
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith('91') && !/^91[6-9]\d{9}$/.test(digitsOnly)) {
    return { isValid: false, error: 'Please enter a valid 10-digit Indian phone number.' }
  }

  return { isValid: true }
}

/**
 * Validates delivery address completeness for commercial shipping
 */
export function validateAddress(address: string): ValidationResult {
  const trimmed = address.trim()
  if (!trimmed) {
    return { isValid: false, error: 'Delivery address is required.' }
  }

  // Check minimum character length for a full address
  if (trimmed.length < 15) {
    return {
      isValid: false,
      error: 'Please enter a complete delivery address (building/street, city, state, & 6-digit PIN code).',
    }
  }

  // Reject dummy inputs
  const lower = trimmed.toLowerCase()
  if (['test', 'address', 'chandra nagar', 'na', 'none', 'n/a', 'dummy'].includes(lower)) {
    return {
      isValid: false,
      error: 'Please provide full shipping address details (house/flat no, street, city, state, & PIN code).',
    }
  }

  return { isValid: true }
}

/**
 * Validates customer name
 */
export function validateName(name: string): ValidationResult {
  const trimmed = name.trim()
  if (!trimmed) {
    return { isValid: false, error: 'Your name is required.' }
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters.' }
  }
  return { isValid: true }
}
