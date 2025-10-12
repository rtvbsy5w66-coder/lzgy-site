// src/lib/security-utils.ts

// Email validation regex (more secure)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// URL validation regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// Phone number validation (Hungarian format)
const PHONE_REGEX = /^\+36[0-9]{9}$|^06[0-9]{8,9}$/;

// Hex color validation
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

// SQL injection patterns to detect
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
  /(--|\/\*|\*\/|;|'|"|`)/,
  /(\bOR\b.*=.*\bOR\b)/i,
  /(\bAND\b.*=.*\bAND\b)/i,
];

// XSS patterns to detect
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export class SecurityValidator {
  // Sanitize HTML content
  static async sanitizeHtml(input: string): Promise<string> {
    if (typeof input !== 'string') return '';
    
    // Use dynamic import for DOMPurify to avoid SSR issues
    const DOMPurify = await import('isomorphic-dompurify');
    return DOMPurify.default.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a'],
      ALLOWED_ATTR: ['href', 'target'],
      ALLOW_DATA_ATTR: false
    });
  }

  // Sanitize plain text (remove HTML completely)
  static sanitizeText(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .trim();
  }

  // Validate email
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email || typeof email !== 'string') {
      errors.push('Email cím kötelező');
      return { isValid: false, errors };
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    if (trimmedEmail.length > 254) {
      errors.push('Email cím túl hosszú (max 254 karakter)');
    }
    
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.push('Érvénytelen email formátum');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: trimmedEmail
    };
  }

  // Validate name fields
  static validateName(name: string, fieldName: string = 'Név'): ValidationResult {
    const errors: string[] = [];
    
    if (!name || typeof name !== 'string') {
      errors.push(`${fieldName} kötelező`);
      return { isValid: false, errors };
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      errors.push(`${fieldName} túl rövid (min 2 karakter)`);
    }
    
    if (trimmedName.length > 50) {
      errors.push(`${fieldName} túl hosszú (max 50 karakter)`);
    }

    // Check for suspicious patterns
    if (this.containsSqlInjection(trimmedName)) {
      errors.push(`${fieldName} nem megfelelő karaktereket tartalmaz`);
    }

    const sanitizedName = this.sanitizeText(trimmedName);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitizedName
    };
  }

  // Validate URL
  static validateUrl(url: string): ValidationResult {
    const errors: string[] = [];
    
    if (!url || typeof url !== 'string') {
      return { isValid: true, errors, sanitizedValue: '' }; // URL is optional
    }

    const trimmedUrl = url.trim();
    
    if (!URL_REGEX.test(trimmedUrl)) {
      errors.push('Érvénytelen URL formátum');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: trimmedUrl
    };
  }

  // Validate hex color
  static validateHexColor(color: string): ValidationResult {
    const errors: string[] = [];
    
    if (!color || typeof color !== 'string') {
      return { isValid: true, errors, sanitizedValue: '#3b82f6' }; // Default color
    }

    const trimmedColor = color.trim();
    
    if (!HEX_COLOR_REGEX.test(trimmedColor)) {
      errors.push('Érvénytelen szín formátum (használjon #RRGGBB formátumot)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: trimmedColor
    };
  }

  // Check for SQL injection attempts
  static containsSqlInjection(input: string): boolean {
    if (typeof input !== 'string') return false;
    
    return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
  }

  // Check for XSS attempts
  static containsXss(input: string): boolean {
    if (typeof input !== 'string') return false;
    
    return XSS_PATTERNS.some(pattern => pattern.test(input));
  }

  // Validate content fields (posts, descriptions) 
  static async validateContent(content: string, maxLength: number = 10000): Promise<ValidationResult> {
    const errors: string[] = [];
    
    if (!content || typeof content !== 'string') {
      errors.push('Tartalom kötelező');
      return { isValid: false, errors };
    }

    if (content.length > maxLength) {
      errors.push(`Tartalom túl hosszú (max ${maxLength} karakter)`);
    }

    // Check for malicious content
    if (this.containsXss(content)) {
      errors.push('A tartalom nem megfelelő kódot tartalmaz');
    }

    const sanitizedContent = await this.sanitizeHtml(content);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitizedContent
    };
  }

  // Validate postal code (Hungarian format)
  static validatePostalCode(postalCode: string): ValidationResult {
    const errors: string[] = [];
    
    if (!postalCode || typeof postalCode !== 'string') {
      return { isValid: true, errors, sanitizedValue: '' }; // Optional field
    }

    const trimmed = postalCode.trim();
    const numericOnly = trimmed.replace(/\D/g, '');
    
    if (numericOnly.length !== 4) {
      errors.push('Irányítószám 4 számjegyből kell álljon');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: numericOnly
    };
  }

  // Comprehensive validation for user input
  static async validateUserInput(data: any): Promise<{ isValid: boolean; errors: string[]; sanitizedData: any }> {
    const errors: string[] = [];
    const sanitizedData: any = {};

    // Check if data is object
    if (!data || typeof data !== 'object') {
      errors.push('Érvénytelen adatformátum');
      return { isValid: false, errors, sanitizedData };
    }

    // Validate each field based on its name
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Check for injection attempts
        if (this.containsSqlInjection(value) || this.containsXss(value)) {
          errors.push(`Mező '${key}' nem megfelelő tartalmat tartalmaz`);
          continue;
        }

        // Field-specific validation
        switch (key.toLowerCase()) {
          case 'email':
            const emailValidation = this.validateEmail(value);
            if (!emailValidation.isValid) {
              errors.push(...emailValidation.errors);
            } else {
              sanitizedData[key] = emailValidation.sanitizedValue;
            }
            break;

          case 'firstname':
          case 'lastname':
          case 'name':
            const nameValidation = this.validateName(value, key);
            if (!nameValidation.isValid) {
              errors.push(...nameValidation.errors);
            } else {
              sanitizedData[key] = nameValidation.sanitizedValue;
            }
            break;

          case 'url':
          case 'imageurl':
            const urlValidation = this.validateUrl(value);
            if (!urlValidation.isValid) {
              errors.push(...urlValidation.errors);
            } else {
              sanitizedData[key] = urlValidation.sanitizedValue;
            }
            break;

          case 'color':
            const colorValidation = this.validateHexColor(value);
            if (!colorValidation.isValid) {
              errors.push(...colorValidation.errors);
            } else {
              sanitizedData[key] = colorValidation.sanitizedValue;
            }
            break;

          case 'postalcode':
            const postalValidation = this.validatePostalCode(value);
            if (!postalValidation.isValid) {
              errors.push(...postalValidation.errors);
            } else {
              sanitizedData[key] = postalValidation.sanitizedValue;
            }
            break;

          case 'content':
          case 'description':
          case 'message':
            const contentValidation = await this.validateContent(value);
            if (!contentValidation.isValid) {
              errors.push(...contentValidation.errors);
            } else {
              sanitizedData[key] = contentValidation.sanitizedValue;
            }
            break;

          default:
            // Generic text sanitization
            sanitizedData[key] = this.sanitizeText(value);
        }
      } else {
        // Non-string values passed through (numbers, booleans, etc.)
        sanitizedData[key] = value;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData
    };
  }
}