
// Rate limiting for client-side protection
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      return true;
    }
    
    // Add current attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return false;
  }

  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const timeElapsed = Date.now() - oldestAttempt;
    return Math.max(0, this.windowMs - timeElapsed);
  }
}

export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Input sanitization
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push("Use at least 8 characters");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Include uppercase letters");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Include numbers");

  if (/[^a-zA-Z\d]/.test(password)) score += 1;
  else feedback.push("Include special characters");

  if (password.length >= 12) score += 1;

  return { score, feedback };
};

// Session validation
export const isValidSession = (session: any): boolean => {
  if (!session || !session.access_token || !session.user) {
    return false;
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.expires_at < now) {
    return false;
  }

  return true;
};

// CSRF protection helper
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
