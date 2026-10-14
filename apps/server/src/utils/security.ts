import crypto from 'crypto';

const INSECURE_DEFAULT_SECRETS = [
  'super-secret-jwt-key',
  'super-secret-jwt-key-change-in-production',
  'super-secret-refresh-jwt-key',
  'change-me-in-production'
];

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (isProduction()) {
    if (!secret || INSECURE_DEFAULT_SECRETS.includes(secret) || secret.length < 32) {
      throw new Error(
        'FATAL_SECURITY_ERROR: JWT_SECRET must be configured with at least 32 cryptographically secure characters in production.'
      );
    }
    return secret;
  }
  return secret || 'super-secret-jwt-key-for-local-dev-only';
};

export const getJwtRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (isProduction()) {
    if (!secret || INSECURE_DEFAULT_SECRETS.includes(secret) || secret.length < 32) {
      throw new Error(
        'FATAL_SECURITY_ERROR: JWT_REFRESH_SECRET must be configured with at least 32 cryptographically secure characters in production.'
      );
    }
    return secret;
  }
  return secret || 'super-secret-refresh-jwt-key-for-local-dev-only';
};

/**
 * Generates an unpredictable cryptographic token for email verification and password reset.
 * Replaces insecure Math.random().
 */
export const generateSecureToken = (length: number = 6): string => {
  // Use hex string with sufficient entropy
  const bytes = crypto.randomBytes(Math.ceil(length / 2));
  return bytes.toString('hex').slice(0, length).toUpperCase();
};
