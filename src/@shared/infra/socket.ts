import { Server as HttpServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserSequelizeRepository } from '../../user/infra/user-sequelize.repository';
import { OrderSequelizeRepository } from '../../order/infra/order-sequelize.repository';
import { TradeSequelizeRepository } from '../../trade/infra/trade-sequelize.repository';
import { RedisOrderQueue } from '../../order/infra/order-redis.repository';
import { UserModel } from '../../user/infra/user.model';
import { OrderModel } from '../../order/infra/order.model';
import { TradeModel } from '../../trade/infra/trade.model';
import { PlaceOrderUseCase } from '../../order/application/place-order/place-order.use-case';
import { CancelOrderUseCase } from '../../order/application/cancel-order/cancel-order.use-case';
import { GetStatisticsUseCase } from '../../trade/application/get-statistics/get-statistics.use-case';
import { GetGlobalMatchesUseCase } from '../../trade/application/get-global-matches/get-global-matches.use-case';
import { GetMyHistoryUseCase } from '../../trade/application/get-my-history/get-my-history.use-case';
import { GetMyActiveOrdersUseCase } from '../../order/application/get-my-active-orders/get-my-active-orders.use-case';
import { GetOrderBookUseCase } from '../../order/application/get-order-book/get-order-book.use-case';

dotenv.config();

const JWT_SECRET = process.env.JSON_WEB_TOKEN_SECRET || '';

export function createSocketServer(httpServer: HttpServer) {
  const io = new IOServer(httpServer, { cors: { origin: '*' } });

  const userRepo = new UserSequelizeRepository(UserModel);
  const orderRepo = new OrderSequelizeRepository(OrderModel);
  const tradeRepo = new TradeSequelizeRepository(TradeModel);
  const orderQueue = new RedisOrderQueue(process.env.REDIS_URL!);

  const placeOrderUC = new PlaceOrderUseCase(userRepo, orderRepo, orderQueue);
  const cancelOrderUC = new CancelOrderUseCase(userRepo, orderRepo);
  const statsUC = new GetStatisticsUseCase(tradeRepo, userRepo);
  const globalMatchesUC = new GetGlobalMatchesUseCase(tradeRepo);
  const historyUC = new GetMyHistoryUseCase(userRepo, orderRepo, tradeRepo);
  const myOrdersUC = new GetMyActiveOrdersUseCase(orderRepo);
  const orderBookUC = new GetOrderBookUseCase(orderRepo);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      socket.data.user_id = payload.user_id;
      return next();
    } catch (err) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId: string = socket.data.user_id;
    console.log(`Socket conectado: ${socket.id} (user=${userId})`);

    socket.on('joinOrders', () => {
      socket.join(`orders:${userId}`);
    });

    socket.on('placeOrder', async (input) => {
      try {
        const result = await placeOrderUC.execute({
          ...input,
          user_id: userId,
        });
        socket.emit('orderPlaced', result);
        io.to(`orders:${userId}`).emit('orderBookUpdate');
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('cancelOrder', async ({ order_id }) => {
      try {
        const result = await cancelOrderUC.execute({
          user_id: userId,
          order_id,
        });
        socket.emit('orderCancelled', result);
        io.to(`orders:${userId}`).emit('orderBookUpdate');
      } catch (err: any) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('getStatistics', async () => {
      const stats = await statsUC.execute({ user_id: userId });
      socket.emit('statistics', stats);
    });

    socket.on('getGlobalMatches', async ({ limit }) => {
      const matches = await globalMatchesUC.execute(limit);
      socket.emit('globalMatches', matches);
    });

    socket.on('getMyHistory', async () => {
      const history = await historyUC.execute({ user_id: userId });
      socket.emit('myHistory', history);
    });

    socket.on('getMyOrders', async () => {
      const orders = await myOrdersUC.execute({ user_id: userId });
      socket.emit('myOrders', orders);
    });

    socket.on('getOrderBook', async () => {
      const bids = await orderBookUC.execute();
      const asks = await orderBookUC.execute();
      socket.emit('orderBook', { bids, asks });
    });

    socket.on('disconnect', () => {
      console.log(`Socket desconectou: ${socket.id}`);
    });
  });

  return io;
}
