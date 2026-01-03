"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
var getEnvVar = function (key, defaultValue) {
    var value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error("Environment variable ".concat(key, " is not set"));
    }
    return value;
};
exports.env = {
    DATABASE_URL: getEnvVar('DATABASE_URL'),
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
    PORT: parseInt(getEnvVar('PORT', '3000'), 10),
    NODE_ENV: getEnvVar('NODE_ENV', 'development'),
    SANITY_PROJECT_ID: getEnvVar('SANITY_PROJECT_ID'),
    SANITY_DATASET: getEnvVar('SANITY_DATASET'),
    SANITY_API_VERSION: getEnvVar('SANITY_API_VERSION', '2026-01-03'),
    SANITY_TOKEN: process.env.SANITY_TOKEN,
};
