import { Redis } from '@upstash/redis';
import 'dotenv/config'; // Ensure environment variables are loaded

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let redisClient;

if (!upstashUrl || !upstashToken || upstashUrl.includes("<your-upstash-instance-region>")) {
  console.error('❌ CRITICAL: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not defined or is using placeholder values in .env file.');
  console.error('Please ensure these are correctly set for the application to function.');
  // In a real application, you might want to prevent startup or have a graceful fallback.
  // process.exit(1); // Uncomment to exit if Redis is absolutely critical for startup
} else {
    try {
      redisClient = new Redis({
        url: upstashUrl,
        token: upstashToken,
      });
      // You can optionally add a ping here to test connection on startup, though @upstash/redis is HTTP based.
      // (async () => {
      //   try {
      //     await redisClient.ping();
      //     console.log('✅ Successfully PINGed Upstash Redis.');
      //   } catch (pingError) {
      //     console.error('❌ Failed to PING Upstash Redis on init. Check credentials/URL:', pingError.message);
      //   }
      // })();
      console.log('✅ Upstash Redis client configured. Operations are stateless via HTTP.');
    } catch (error) {
      console.error('❌ Failed to initialize Upstash Redis client instance:', error);
      // process.exit(1); // Uncomment to exit if initialization fails
    }
}

export default redisClient;