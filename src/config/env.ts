import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  PORT: number;
  NODE_ENV: string;
  SANITY_PROJECT_ID: string;
  SANITY_DATASET: string;
  SANITY_API_VERSION: string;
  SANITY_TOKEN?: string;
  EMAIL_SERVICE: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;
  OTP_EXPIRY_MINUTES: number;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

export const env: EnvConfig = {
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  PORT: parseInt(getEnvVar('PORT', '3000'), 10),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  SANITY_PROJECT_ID: getEnvVar('SANITY_PROJECT_ID'),
  SANITY_DATASET: getEnvVar('SANITY_DATASET'),
  SANITY_API_VERSION: getEnvVar('SANITY_API_VERSION', '2023-05-03'),
  SANITY_TOKEN: process.env.SANITY_TOKEN,
  EMAIL_SERVICE: getEnvVar('EMAIL_SERVICE', 'smtp'),
  EMAIL_HOST: getEnvVar('EMAIL_HOST'),
  EMAIL_PORT: parseInt(getEnvVar('EMAIL_PORT', '587'), 10),
  EMAIL_USER: getEnvVar('EMAIL_USER'),
  EMAIL_PASSWORD: getEnvVar('EMAIL_PASSWORD'),
  EMAIL_FROM: getEnvVar('EMAIL_FROM'),
  OTP_EXPIRY_MINUTES: parseInt(getEnvVar('OTP_EXPIRY_MINUTES', '10'), 10),
};