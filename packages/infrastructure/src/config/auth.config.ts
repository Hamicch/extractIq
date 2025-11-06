function validateJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error(
            'JWT_SECRET environment variable is required. Set it to a secure random string (minimum 32 characters). Generate with: openssl rand -base64 32'
        );
    }

    if (secret.trim().length === 0) {
        throw new Error('JWT_SECRET cannot be empty. Set it to a secure random string (minimum 32 characters).');
    }

    if (secret.length < 32) {
        throw new Error(
            `JWT_SECRET must be at least 32 characters long. Current length: ${secret.length}. Generate a secure secret with: openssl rand -base64 32`
        );
    }

    return secret;
}

export const authConfig = {
  jwt: {
        secret: validateJwtSecret(),
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
  },
  bcrypt: {
    saltRounds: 10,
  },
};
