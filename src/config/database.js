"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("../../prisma/generated/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var pg_1 = require("pg");
var env_1 = require("./env");
var pool = new pg_1.Pool({
    connectionString: env_1.env.DATABASE_URL,
});
var adapter = new adapter_pg_1.PrismaPg(pool);
var prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    adapter: adapter
});
exports.default = prisma;
