const { put, del, list } = require('@vercel/blob');
const { Redis } = require('@upstash/redis');
require('dotenv').config();

// Create an Upstash Redis (KV) client instance
const kv = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

module.exports = { put, get, del, list, kv };