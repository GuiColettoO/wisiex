import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { initDatabase } from './@shared/infra/database/sequelize/sequelize';
import { initCache } from './@shared/infra/database/redis/redis';
import { createSocketServer } from './@shared/infra/socket';
import { UserSequelizeRepository } from './user/infra/user-sequelize.repository';
import { OrderSequelizeRepository } from './order/infra/order-sequelize.repository';
import { TradeSequelizeRepository } from './trade/infra/trade-sequelize.repository';
import { RedisOrderQueue } from './order/infra/order-redis.repository';
import { UserModel } from './user/infra/user.model';
import { OrderModel } from './order/infra/order.model';
import { TradeModel } from './trade/infra/trade.model';
import { MatchOrdersDaemon } from './order/application/match-orders/match-orders.daemon';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000');
const REDIS_URL = process.env.REDIS_URL;

async function bootstrap() {
  try {
    await initDatabase();
    await initCache();

    const userRepo = new UserSequelizeRepository(UserModel);
    const orderRepo = new OrderSequelizeRepository(OrderModel);
    const tradeRepo = new TradeSequelizeRepository(TradeModel);
    const orderQueue = new RedisOrderQueue(REDIS_URL);

    const matchDaemon = new MatchOrdersDaemon(
      orderQueue,
      orderRepo,
      tradeRepo,
      userRepo
    );
    matchDaemon.run();

    const app = express();
    app.use(express.json());

    const server = http.createServer(app);

    const io = new SocketIOServer(server, {
      cors: { origin: '*' },
    });

    createSocketServer(server);

    server.listen(PORT, () => {
      console.log(`Server rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Falha ao iniciar:', err);
    process.exit(1);
  }
}

bootstrap();
