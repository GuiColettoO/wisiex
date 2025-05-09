import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const {
  REDIS_HOST = '127.0.0.1',
  REDIS_PORT = '6379',
  REDIS_DB   = '0',
  REDIS_PASS = undefined,
} = process.env;

export const redisClient = new Redis({
  host:     REDIS_HOST,
  port:     parseInt(REDIS_PORT, 10),
  db:       parseInt(REDIS_DB, 10),
  password: REDIS_PASS,
});

export async function initCache(): Promise<void> {
  try {
    await redisClient.ping();
    console.log('Conectado ao Redis');
  } catch (err) {
    console.error('Erro na inicialização do Redis:', err);
    process.exit(1);
  }
}
