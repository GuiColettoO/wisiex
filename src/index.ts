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
import { SignInUseCase } from './user/application/authentication.use-case';

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
    const signInUC = new SignInUseCase(userRepo);

    const matchDaemon = new MatchOrdersDaemon(
      orderQueue,
      orderRepo,
      tradeRepo,
      userRepo
    );
    matchDaemon.run();

    const app = express();
    app.use(express.json());

    app.post('/signin', async (req, res) => {
      const { username } = req.body;
      try {
        const { access_token } = await signInUC.execute({ username });
        res.json({ access_token });
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    });

    const server = http.createServer(app);

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
